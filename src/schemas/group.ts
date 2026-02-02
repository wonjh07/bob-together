import { z } from 'zod';

export const groupNameSchema = z
  .string()
  .trim()
  .min(1, '그룹명을 입력해주세요.')
  .max(30, '그룹명은 30자 이내로 입력해주세요.');

export const groupFormSchema = z.object({
  groupName: groupNameSchema,
});

export const groupSearchSchema = z
  .string()
  .trim()
  .min(2, '검색어를 2자 이상 입력해주세요.')
  .max(30, '검색어는 30자 이내로 입력해주세요.');

export const groupSearchFormSchema = z.object({
  query: groupSearchSchema,
});

export type GroupNameInput = z.infer<typeof groupNameSchema>;
export type GroupFormInput = z.infer<typeof groupFormSchema>;
export type GroupSearchFormInput = z.infer<typeof groupSearchFormSchema>;
