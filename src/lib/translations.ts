'use server';

import enMessages from '@/messages/en.json';
import idMessages from '@/messages/id.json';
import { Locale, DEFAULT_LOCALE } from './i18n';
import { Messages } from './translation-types';

const messages: Record<Locale, Messages> = {
  en: enMessages,
  id: idMessages,
};

export async function getMessages(locale: Locale): Promise<Messages> {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}