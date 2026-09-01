import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Patient, Visit } from '../types/models';
import { toCsv } from '../utils/csv';
import { formatDate, formatDateHuman } from '../utils/date';
import { getMonthVisits } from './visitService';

function filename(label: string, ext = 'csv'): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  return `${FileSystem.documentDirectory}${label}_${stamp}.${ext}`;
}

async function shareFileUri(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export' });
  } else {
    throw new Error('Sharing is not available on this device.');
  }
}

export async function exportPatientsCsv(patients: Patient[]): Promise<void> {
  const rows = patients.map((p) => ({
    id: p.id,
    name: p.name,
    village: p.village,
    city: p.city ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    age: p.age ?? '',
    dob: p.dob ?? '',
    currentIssue: p.currentIssue ?? '',
    lastVisitDate: p.lastVisitDate ? formatDate(p.lastVisitDate) : '',
    registered: formatDate(p.createdAt),
  }));

  const csv = toCsv(rows, [
    { header: 'Patient ID', value: (r) => r.id },
    { header: 'Name', value: (r) => r.name },
    { header: 'Village', value: (r) => r.village },
    { header: 'City', value: (r) => r.city },
    { header: 'Phone', value: (r) => r.phone },
    { header: 'Address', value: (r) => r.address },
    { header: 'Age', value: (r) => r.age },
    { header: 'DOB', value: (r) => r.dob },
    { header: 'Current Issue', value: (r) => r.currentIssue },
    { header: 'Last Visit', value: (r) => r.lastVisitDate },
    { header: 'Registered', value: (r) => r.registered },
  ]);

  const uri = filename('patients');
  await FileSystem.writeAsStringAsync(uri, csv);
  await shareFileUri(uri);
}

export async function exportCurrentMonthVisits(monthOffset = 0): Promise<void> {
  const visits = await getMonthVisits(monthOffset);
  const rows: Array<{
    patientId: string;
    date: string;
    issue: string;
    diagnosis: string;
    treatment: string;
    prescription: string;
    notes: string;
    nextVisit: string;
  }> = visits.map((v: Visit) => ({
    patientId: v.patientId,
    date: formatDate(v.date),
    issue: v.issue ?? '',
    diagnosis: v.diagnosis ?? '',
    treatment: v.treatment ?? '',
    prescription: v.prescription ?? '',
    notes: v.notes ?? '',
    nextVisit: v.nextVisitDate ? formatDate(v.nextVisitDate) : '',
  }));

  const csv = toCsv(rows, [
    { header: 'Patient ID', value: (r) => r.patientId },
    { header: 'Date', value: (r) => r.date },
    { header: 'Issue', value: (r) => r.issue },
    { header: 'Diagnosis', value: (r) => r.diagnosis },
    { header: 'Treatment', value: (r) => r.treatment },
    { header: 'Prescription', value: (r) => r.prescription },
    { header: 'Notes', value: (r) => r.notes },
    { header: 'Next Visit', value: (r) => r.nextVisit },
  ]);

  const uri = filename(`visits_${formatDateHuman(new Date()).replace(/[^a-z0-9]/gi, '')}`);
  await FileSystem.writeAsStringAsync(uri, csv);
  await shareFileUri(uri);
}
