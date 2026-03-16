from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.reports.models import IncidentReport
from apps.reports.serializers import ReportSerializer

STAFF_ROLE = 'LOGISTICS_STAFF'

class IncidentReportViewSet(viewsets.ModelViewSet):
	queryset = IncidentReport.objects.all()
	serializer_class = ReportSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		user = self.request.user
		if user.role.upper() == STAFF_ROLE:
			return IncidentReport.objects.all()
		return IncidentReport.objects.filter(reporter=user)

	def perform_create(self, serializer):
		serializer.save(reporter=self.request.user)

	def _check_staff(self, request):
		if request.user.role.upper() != STAFF_ROLE:
			from rest_framework.response import Response as Resp
			from rest_framework import status as st
			return Resp(
				{"detail": "Only staff can update report status."}, 
				status=st.HTTP_403_FORBIDDEN
			)
		return None

	def update(self, request, *args, **kwargs):
		denied = self._check_staff(request)
		if denied:
			return denied
		kwargs['partial'] = True  # always allow partial to avoid requiring all fields
		return super().update(request, *args, **kwargs)

	def partial_update(self, request, *args, **kwargs):
		denied = self._check_staff(request)
		if denied:
			return denied
		return super().partial_update(request, *args, **kwargs)
