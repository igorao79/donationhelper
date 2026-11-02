import type { Author, Method } from "./methods";

const env = (name: string) => process.env[name]?.trim() || undefined;

const byFour = (value: string) => value.match(/.{1,4}/g) ?? [value];

function parsePhone(raw: string) {
  const compact = raw.replace(/[^\d+]/g, "");
  const value = /^8\d{10}$/.test(compact) ? `+7${compact.slice(1)}` : compact;
  const ru = value.match(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return { value, chunks: ru ? ru.slice(1) : byFour(value) };
}

const SCAN_IN_WALLET = "Отсканируй сканером внутри кошелька";

/**
 * В QR зашита ссылка, которую камера телефона предлагает открыть в кошельке.
 * Адрес получателя идёт первым: сканер, понимающий только адрес, не примет за него контракт токена.
 */
const USDT_TON_MASTER = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs";
const BSC_CHAIN_ID = 56;

function usdt(
  id: string,
  network: string,
  address: string,
  color: string,
  qr = address,
  scanHint = SCAN_IN_WALLET,
): Method {
  return {
    id,
    group: "usdt",
    tab: network,
    tabSub: "USDT",
    eyebrow: "USDT, сеть",
    title: network,
    fieldLabel: "Адрес кошелька",
    value: address,
    chunks: byFour(address),
    qr,
    qrLabel: `USDT ${network}`,
    scanHint,
    note: `Отправляй только USDT и только в сети ${network}. В другой сети перевод может потеряться.`,
    color,
  };
}

export function getAuthor(): Author {
  return {
    heading: env("DONATE_HEADING") ?? "Поддержать автора канала",
    name: env("AUTHOR_NAME"),
    url: env("AUTHOR_URL"),
    avatar: env("AUTHOR_AVATAR"),
  };
}

/** Способ попадает на карточку, только если его реквизиты заданы в окружении. */
export function getMethods(): Method[] {
  const methods: Method[] = [];

  const sbpPhone = env("SBP_PHONE");
  if (sbpPhone) {
    const phone = parsePhone(sbpPhone);
    const banks = env("SBP_BANKS");
    const recipient = env("SBP_RECIPIENT");
    methods.push({
      id: "sbp",
      group: "rub",
      tab: "СБП",
      tabSub: banks ?? "По телефону",
      eyebrow: banks ?? "По номеру телефона",
      title: "СБП",
      fieldLabel: "Номер телефона",
      ...phone,
      qr: phone.value,
      qrLabel: "СБП",
      scanHint: "В QR номер: вставь его в перевод по СБП",
      note: recipient
        ? `Получатель: ${recipient}. Сверь имя перед отправкой.`
        : "Сверь имя получателя перед отправкой.",
      color: "#3fe08a",
    });
  }

  const wallet = env("YOOMONEY_WALLET");
  if (wallet) {
    const href = `https://yoomoney.ru/to/${wallet}`;
    methods.push({
      id: "yoomoney",
      group: "rub",
      tab: "ЮMoney",
      tabSub: "Кошелёк",
      eyebrow: "Кошелёк",
      title: "ЮMoney",
      fieldLabel: "Номер кошелька",
      value: wallet,
      chunks: byFour(wallet),
      qr: href,
      qrLabel: "ЮMoney",
      scanHint: "Откроется страница перевода ЮMoney",
      note: "На странице перевода укажи сумму и откуда списать.",
      link: { href, label: "Открыть перевод" },
      color: "#b79bff",
    });
  }

  const yoomoneyPhone = env("YOOMONEY_SBP_PHONE");
  if (yoomoneyPhone) {
    const phone = parsePhone(yoomoneyPhone);
    methods.push({
      id: "yoomoney-sbp",
      group: "rub",
      tab: "ЮMoney",
      tabSub: "СБП",
      eyebrow: "ЮMoney по СБП",
      title: "СБП",
      fieldLabel: "Номер телефона",
      ...phone,
      qr: phone.value,
      qrLabel: "ЮMoney по СБП",
      scanHint: "В QR номер: вставь его в перевод по СБП",
      note: "В приложении банка выбери банк получателя: ЮMoney.",
      color: "#ff9ed8",
    });
  }

  const trc20 = env("USDT_TRC20");
  if (trc20) methods.push(usdt("trc20", "TRC20", trc20, "#ff5a4d"));

  const bep20 = env("USDT_BEP20");
  if (bep20) {
    methods.push(
      usdt(
        "bep20",
        "BEP20",
        bep20,
        "#ffd21f",
        `ethereum:${bep20}@${BSC_CHAIN_ID}`,
        "Камера предложит кошелёк, в нём выбери USDT",
      ),
    );
  }

  const ton = env("USDT_TON");
  if (ton) {
    methods.push(
      usdt(
        "ton",
        "TON",
        ton,
        "#4db2ff",
        `ton://transfer/${ton}?jetton=${USDT_TON_MASTER}`,
        "Камера предложит открыть кошелёк",
      ),
    );
  }

  return methods;
}
