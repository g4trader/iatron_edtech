'use server';

import { revalidatePath } from 'next/cache';
import {
  assignMedicalSpecialtyOwnerSchema,
  adminInviteUserSchema,
  adminRolesUpdateSchema,
  setMedicalSpecialtyOwnerStatusSchema,
} from '@iatron/contracts';
import { admin } from './server/admin';

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? '').trim();

export async function inviteUser(formData: FormData) {
  const input = adminInviteUserSchema.parse({
    email: value(formData, 'email'),
    displayName: value(formData, 'displayName'),
    role: value(formData, 'role'),
  });
  await admin.mutate('/admin/users/invite', input);
  revalidatePath('/admin/users');
}

export async function setUserStatus(formData: FormData) {
  const id = value(formData, 'id');
  const action = value(formData, 'action');
  if (!['enable', 'disable'].includes(action))
    throw new Error('Ação inválida.');
  await admin.mutate(`/admin/users/${id}/${action}`);
  revalidatePath('/admin/users');
}

export async function resetUserAccess(formData: FormData) {
  const id = value(formData, 'id');
  await admin.mutate(`/admin/users/${id}/reset-access`);
  revalidatePath('/admin/users');
}

export async function updateUserRoles(formData: FormData) {
  const id = value(formData, 'id');
  const input = adminRolesUpdateSchema.parse({
    roles: formData.getAll('roles').map(String),
    confirmed: formData.get('confirmed') === 'true',
  });
  await admin.mutate(`/admin/users/${id}/roles`, input);
  revalidatePath('/admin/users');
}

export async function assignSpecialtyOwner(formData: FormData) {
  const specialtyId = value(formData, 'specialtyId');
  const input = assignMedicalSpecialtyOwnerSchema.parse({
    mentorId: value(formData, 'mentorId'),
    ownerRole: value(formData, 'ownerRole'),
    authorizationReference: value(formData, 'authorizationReference'),
    requestId: crypto.randomUUID(),
  });
  await admin.mutate(`/editorial/specialties/${specialtyId}/owners`, input);
  revalidatePath('/admin/specialties');
  revalidatePath(`/admin/specialties/${specialtyId}`);
}

export async function setSpecialtyOwnerStatus(formData: FormData) {
  const specialtyId = value(formData, 'specialtyId');
  const ownershipId = value(formData, 'ownershipId');
  const rawUntil = value(formData, 'unavailableUntil');
  const input = setMedicalSpecialtyOwnerStatusSchema.parse({
    status: value(formData, 'status'),
    reason: value(formData, 'reason'),
    unavailableUntil: rawUntil ? new Date(rawUntil).toISOString() : null,
    requestId: crypto.randomUUID(),
  });
  await admin.mutate(`/admin/specialty-owners/${ownershipId}/status`, input);
  revalidatePath('/admin/specialties');
  revalidatePath(`/admin/specialties/${specialtyId}`);
}
