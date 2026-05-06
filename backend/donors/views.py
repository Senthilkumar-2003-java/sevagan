from datetime import date
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Donor
from .serializers import DonorSerializer


# ── Auth ─────────────────────────────────────────────────────────────────────

VALID_EMAIL    = 'sevagan.senthil@gmail.com'
VALID_PASSWORD = 'Senthil@2003'


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email    = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()

    if email == VALID_EMAIL and password == VALID_PASSWORD:
        user, _ = User.objects.get_or_create(
            username='sevagan_admin',
            defaults={'email': email},
        )
        if not user.check_password(password):
            user.set_password(password)
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        })

    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)


# ── Donors CRUD ───────────────────────────────────────────────────────────────

class DonorViewSet(viewsets.ModelViewSet):
    queryset           = Donor.objects.all()
    serializer_class   = DonorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs     = Donor.objects.all()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)  |
                Q(last_name__icontains=search)   |
                Q(phone__icontains=search)       |
                Q(id__icontains=search)
            )
        return qs


# ── Upcoming Events ───────────────────────────────────────────────────────────

def _days_until(event_date: date, today: date) -> int | None:
    """Return days until next occurrence of event_date (month/day match), or None."""
    if not event_date:
        return None
    try:
        this_year = event_date.replace(year=today.year)
    except ValueError:          # Feb 29 in non-leap year
        this_year = event_date.replace(year=today.year, day=28)

    if this_year < today:
        try:
            this_year = event_date.replace(year=today.year + 1)
        except ValueError:
            this_year = event_date.replace(year=today.year + 1, day=28)

    diff = (this_year - today).days
    return diff if 0 <= diff <= 5 else None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_events(request, event_type):
    today  = date.today()
    result = []

    for donor in Donor.objects.all():
        events = []

        def push(ev_date, label, person=None):
            d = _days_until(ev_date, today)
            if d is not None:
                events.append({
                    'label':       label,
                    'person':      person,
                    'date':        str(ev_date),
                    'days_until':  d,
                })

        if event_type == 'birthday':
            if donor.donor_type == 'birthday':
                push(donor.type_date, "Own Birthday")
            push(donor.mother_birthday,  "Mother's Birthday", donor.mother_name)
            push(donor.father_birthday,  "Father's Birthday", donor.father_name)
            push(donor.child_birthday,   "Child's Birthday",  donor.child_name)
            push(donor.wife_birthday,    "Wife's Birthday",   donor.wife_name)

        elif event_type == 'anniversary':
            if donor.donor_type == 'anniversary':
                push(donor.type_date, "Own Anniversary")
            push(donor.wife_anniversary,    "Wife Anniversary",    donor.wife_name)
            push(donor.parents_anniversary, "Parents Anniversary")

        elif event_type == 'memorial':
            if donor.donor_type == 'memorial':
                push(donor.type_date, "Memorial")

        if events:
            result.append({
                'id':       donor.id,
                'name':     f"{donor.first_name} {donor.last_name}",
                'phone':    donor.phone,
                'alt_phone': donor.alt_phone,
                'events':   events,
            })

    # Sort by soonest event
    result.sort(key=lambda x: min(e['days_until'] for e in x['events']))
    return Response(result)