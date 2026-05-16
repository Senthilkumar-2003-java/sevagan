from datetime import date
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Donor, ConfirmedDonor, DonorAction
from .serializers import DonorSerializer, ConfirmedDonorSerializer


# ── Auth ──────────────────────────────────────────────────────────────────────

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
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)  |
                Q(phone__icontains=search)       |
                Q(id__icontains=search)
            )
        return qs


# ── Upcoming Events ───────────────────────────────────────────────────────────

def _days_until(event_date: date, today: date) -> int | None:
    if not event_date:
        return None
    try:
        this_year = event_date.replace(year=today.year)
    except ValueError:
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

    # ── Skip donors already acted on this year for this event type ────────────
    acted_ids = set(
        DonorAction.objects.filter(
            event_type=event_type,
            year=today.year
        ).values_list('donor_id', flat=True)
    )

    for donor in Donor.objects.all():
        if donor.id in acted_ids:
            continue

        events = []

        def push(ev_date, label, person=None):
            d = _days_until(ev_date, today)
            if d is not None:
                events.append({
                    'label':      label,
                    'person':     person,
                    'date':       str(ev_date),
                    'days_until': d,
                })

        if event_type == 'birthday':
            if donor.donor_type == 'birthday':
                push(donor.type_date, "Own Birthday")
            push(donor.mother_birthday, "Mother's Birthday", donor.mother_name)
            push(donor.father_birthday, "Father's Birthday", donor.father_name)
            push(donor.child_birthday,  "Child's Birthday",  donor.child_name)
            push(donor.wife_birthday,   "Wife's Birthday",   donor.wife_name)

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

    result.sort(key=lambda x: min(e['days_until'] for e in x['events']))
    return Response(result)


# ── Confirm / Next-Time / Reject from Sidebar ─────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_donor(request):
    """Save ConfirmedDonor record + mark DonorAction as confirmed."""
    donor_id      = request.data.get('donor_id')
    event_type    = request.data.get('event_type')
    occasion_type = request.data.get('occasion_type')
    occasion_date = request.data.get('occasion_date')
    food          = request.data.get('food')

    try:
        donor = Donor.objects.get(pk=donor_id)
    except Donor.DoesNotExist:
        return Response({'error': 'Donor not found'}, status=404)

    ConfirmedDonor.objects.create(
        donor=donor,
        occasion_type=occasion_type,
        occasion_date=occasion_date,
        food=food,
    )
    DonorAction.objects.get_or_create(
        donor=donor,
        event_type=event_type,
        year=date.today().year,
        defaults={'action': 'confirmed'},
    )
    return Response({'status': 'confirmed'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def next_time_donor(request):
    """Hide donor from sidebar for this year; re-appears automatically next year."""
    donor_id   = request.data.get('donor_id')
    event_type = request.data.get('event_type')

    try:
        donor = Donor.objects.get(pk=donor_id)
    except Donor.DoesNotExist:
        return Response({'error': 'Donor not found'}, status=404)

    DonorAction.objects.get_or_create(
        donor=donor,
        event_type=event_type,
        year=date.today().year,
        defaults={'action': 'next_time'},
    )
    return Response({'status': 'next_time'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def reject_donor(request, donor_id):
    """Permanently delete donor from database."""
    try:
        Donor.objects.get(pk=donor_id).delete()
        return Response({'status': 'rejected'})
    except Donor.DoesNotExist:
        return Response({'error': 'Donor not found'}, status=404)


# ── Confirmed Donors Page ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def confirmed_donors_list(request):
    serializer = ConfirmedDonorSerializer(ConfirmedDonor.objects.all(), many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def complete_confirmed(request, confirmed_id):
    """Remove from confirmed list — donor stays in DB."""
    try:
        ConfirmedDonor.objects.get(pk=confirmed_id).delete()
        return Response({'status': 'completed'})
    except ConfirmedDonor.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def reject_confirmed(request, confirmed_id):
    """Permanently delete the donor from DB (cascades confirmed record)."""
    try:
        record = ConfirmedDonor.objects.get(pk=confirmed_id)
        record.donor.delete()
        return Response({'status': 'rejected'})
    except ConfirmedDonor.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)