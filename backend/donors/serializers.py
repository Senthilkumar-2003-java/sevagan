from rest_framework import serializers
from .models import Donor, ConfirmedDonor


class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Donor
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ConfirmedDonorSerializer(serializers.ModelSerializer):
    first_name  = serializers.SerializerMethodField()
    last_name   = serializers.SerializerMethodField()
    phone       = serializers.SerializerMethodField()
    alt_phone   = serializers.SerializerMethodField()
    address     = serializers.SerializerMethodField()
    gender      = serializers.SerializerMethodField()
    occupation  = serializers.SerializerMethodField()

    class Meta:
        model  = ConfirmedDonor
        fields = [
            'id', 'donor',
            'first_name', 'last_name',
            'phone', 'alt_phone',
            'address', 'gender', 'occupation',
            'occasion_type', 'occasion_date', 'food',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_first_name(self, obj):  return obj.donor.first_name
    def get_last_name(self, obj):   return obj.donor.last_name
    def get_phone(self, obj):       return obj.donor.phone
    def get_alt_phone(self, obj):   return obj.donor.alt_phone
    def get_address(self, obj):     return obj.donor.address
    def get_gender(self, obj):      return obj.donor.gender
    def get_occupation(self, obj):  return obj.donor.occupation