from django.db import models

class Donor(models.Model):
    FOOD_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('night', 'Night'),
    ]
    DONOR_TYPE = [
        ('birthday', 'Birthday'),
        ('anniversary', 'Anniversary'),
        ('memorial', 'Memorial'),
    ]
    GENDER = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    # ── Required Fields ─────────────────────────────────────────────────────
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)
    address     = models.TextField()
    phone       = models.CharField(max_length=20)
    alt_phone   = models.CharField(max_length=20)
    gender      = models.CharField(max_length=10, choices=GENDER)
    occupation  = models.CharField(max_length=100)
    donor_type  = models.CharField(max_length=20, choices=DONOR_TYPE)
    type_date   = models.DateField()           # Birthday / Anniversary / Memorial date
    food        = models.CharField(max_length=20, choices=FOOD_CHOICES)

    # ── Optional Family Fields ───────────────────────────────────────────────
    mother_name        = models.CharField(max_length=100, blank=True, null=True)
    mother_birthday    = models.DateField(blank=True, null=True)

    father_name        = models.CharField(max_length=100, blank=True, null=True)
    father_birthday    = models.DateField(blank=True, null=True)

    child_name         = models.CharField(max_length=100, blank=True, null=True)
    child_birthday     = models.DateField(blank=True, null=True)

    wife_name          = models.CharField(max_length=100, blank=True, null=True)
    wife_birthday      = models.DateField(blank=True, null=True)
    wife_anniversary   = models.DateField(blank=True, null=True)

    parents_anniversary = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['-created_at']


# ── ADD AT BOTTOM OF models.py ────────────────────────────────────────────────

class ConfirmedDonor(models.Model):
    FOOD_CHOICES = [
        ('morning',   'Morning'),
        ('afternoon', 'Afternoon'),
        ('night',     'Night'),
    ]
    OCCASION_CHOICES = [
        ('birthday',    'Birthday'),
        ('anniversary', 'Anniversary'),
        ('memorial',    'Memorial'),
    ]

    donor         = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='confirmations')
    occasion_type = models.CharField(max_length=20, choices=OCCASION_CHOICES)
    occasion_date = models.DateField()
    food          = models.CharField(max_length=20, choices=FOOD_CHOICES)
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Confirmed: {self.donor} – {self.occasion_type}"

    class Meta:
        ordering = ['-created_at']


class DonorAction(models.Model):
    """Tracks per-year confirm/next-time so donors vanish from sidebar after action."""
    ACTION_CHOICES = [
        ('confirmed',  'Confirmed'),
        ('next_time',  'Next Time'),
    ]

    donor      = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='actions')
    event_type = models.CharField(max_length=20)   # birthday | anniversary | memorial
    action     = models.CharField(max_length=20, choices=ACTION_CHOICES)
    year       = models.IntegerField()

    class Meta:
        unique_together = ['donor', 'event_type', 'year']

    def __str__(self):
        return f"{self.donor} – {self.event_type} – {self.action} ({self.year})"        