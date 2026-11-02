export type MethodGroup = "rub" | "usdt";

export type Author = {
  heading: string;
  name?: string;
  url?: string;
  avatar?: string;
};

export type Method = {
  id: string;
  group: MethodGroup;
  tab: string;
  tabSub: string;
  eyebrow: string;
  title: string;
  fieldLabel: string;
  /** Что попадает в буфер обмена. */
  value: string;
  /** Как значение разбито на группы при показе. */
  chunks: string[];
  /** Что зашито в QR. */
  qr: string;
  qrLabel: string;
  /** Подпись под QR: что произойдёт после сканирования. */
  scanHint: string;
  note: string;
  link?: { href: string; label: string };
  color: string;
};

export const GROUPS: { id: MethodGroup; label: string }[] = [
  { id: "rub", label: "Рубли" },
  { id: "usdt", label: "Крипта" },
];
