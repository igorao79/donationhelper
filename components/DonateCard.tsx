"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { GROUPS, type Author, type Method } from "@/lib/methods";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Без HTTPS clipboard API недоступен
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

type Props = {
  author: Author;
  methods: Method[];
  initialId?: string;
  /** Интервал смены способов в секундах; задан только в режиме для стрима. */
  streamSeconds: number | null;
};

export function DonateCard({ author, methods, initialId, streamSeconds }: Props) {
  const [index, setIndex] = useState(() =>
    Math.max(
      methods.findIndex((m) => m.id === initialId),
      0,
    ),
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const method: Method | undefined = methods[index];
  const count = methods.length;
  const isStream = streamSeconds !== null;

  const select = useCallback(
    (next: number) => {
      const wrapped = (next + count) % count;
      setIndex(wrapped);
      setCopiedId(null);

      const url = new URL(window.location.href);
      url.searchParams.set("m", methods[wrapped].id);
      window.history.replaceState(null, "", url);

      if (document.activeElement?.getAttribute("role") === "tab") {
        tabRefs.current[wrapped]?.focus();
      }
    },
    [count, methods],
  );

  useEffect(() => {
    if (count === 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const digit = Number(event.key);
      if (digit >= 1 && digit <= count) select(digit - 1);
      else if (event.key === "ArrowRight") select(index + 1);
      else if (event.key === "ArrowLeft") select(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, index, select]);

  useEffect(() => {
    if (streamSeconds === null || count === 0) return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % count),
      streamSeconds * 1000,
    );
    return () => clearTimeout(timer);
  }, [count, index, streamSeconds]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  if (!method) {
    return (
      <main className="stage">
        <p className="empty">Реквизиты не заданы: заполни .env</p>
      </main>
    );
  }

  const copy = async (target: Method) => {
    await writeClipboard(target.value);
    setCopiedId(target.id);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedId(null), 1800);
  };

  const stageStyle = {
    "--accent": method.color,
    "--rotate": `${streamSeconds ?? 0}s`,
  } as CSSProperties;

  return (
    <main
      className={`stage${isStream ? " stage--stream" : ""}`}
      style={stageStyle}
    >
      <article className="card">
        <div className="card__inner">
          <section className="qr" aria-label="QR-код">
            <div className="qr__code" key={method.id}>
              <QRCodeSVG
                value={method.qr}
                level="M"
                marginSize={4}
                size={512}
                bgColor="#ffffff"
                fgColor="#000000"
                title={`QR-код: ${method.qrLabel}`}
              />
            </div>
            <p className="qr__caption">
              <span className="swatch" aria-hidden="true" />
              <span className="qr__texts">
                {methods.map((m, i) => (
                  <span
                    key={m.id}
                    className={`qr__text${i === index ? " is-active" : ""}`}
                  >
                    <strong>{m.qrLabel}</strong>
                    {m.scanHint}
                  </span>
                ))}
              </span>
            </p>
          </section>

          <div className="info">
            <header className="head">
              {author.avatar ? (
                <Image
                  className="head__avatar"
                  src={author.avatar}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                />
              ) : (
                <span className="head__mark" aria-hidden="true" />
              )}
              <div>
                <h1>{author.heading}</h1>
                {author.name &&
                  (author.url ? (
                    <a
                      className="head__author"
                      href={author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {author.name}
                    </a>
                  ) : (
                    <span className="head__author">{author.name}</span>
                  ))}
              </div>
            </header>

            {/* Все панели лежат друг на друге: размер блока задаёт самая большая, поэтому при смене способа ничего не двигается */}
            <div className="main">
              {methods.map((m, i) => (
                <div
                  key={m.id}
                  className={`panel${i === index ? " is-active" : ""}`}
                  role="tabpanel"
                  id={`panel-${m.id}`}
                  aria-labelledby={`tab-${m.id}`}
                >
                  <p className="eyebrow">{m.eyebrow}</p>
                  <h2 className="title">{m.title}</h2>

                  <p className="field-label">{m.fieldLabel}</p>
                  <div className="value-box">
                    <p className={`value${m.group === "rub" ? " value--big" : ""}`}>
                      {m.chunks.map((chunk, j) => (
                        <span key={j}>{chunk}</span>
                      ))}
                    </p>
                    {!isStream && (
                      <button
                        className="copy"
                        type="button"
                        onClick={() => copy(m)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          {copiedId === m.id ? (
                            <path d="M4 12.5 9.5 18 20 6.5" />
                          ) : (
                            <>
                              <rect x="9" y="9" width="11" height="11" rx="2" />
                              <path d="M5 15H4V4h11v1" />
                            </>
                          )}
                        </svg>
                        <span className="copy__label">
                          <span aria-hidden="true">Копировать</span>
                          <span role="status">
                            {copiedId === m.id ? "Готово" : "Копировать"}
                          </span>
                        </span>
                      </button>
                    )}
                  </div>

                  {!isStream && m.link ? (
                    <a
                      className="link-btn"
                      href={m.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m.link.label}
                    </a>
                  ) : (
                    <p className="note">{m.note}</p>
                  )}
                </div>
              ))}
            </div>

            <nav className="tabs" role="tablist" aria-label="Способ перевода">
              {GROUPS.filter((g) => methods.some((m) => m.group === g.id)).map(
                (group) => (
                  <div className="tabs__group" key={group.id}>
                    <span className="tabs__label">{group.label}</span>
                    <div className="tabs__row">
                      {methods.map((m, i) =>
                        m.group !== group.id ? null : (
                          <button
                            key={m.id}
                            ref={(el) => {
                              tabRefs.current[i] = el;
                            }}
                            id={`tab-${m.id}`}
                            className="tab"
                            type="button"
                            role="tab"
                            aria-selected={i === index}
                            aria-controls={`panel-${m.id}`}
                            tabIndex={i === index ? 0 : -1}
                            style={{ "--tab": m.color } as CSSProperties}
                            onClick={() => select(i)}
                          >
                            <span className="tab__name">
                              <span className="swatch" aria-hidden="true" />
                              {m.tab}
                            </span>
                            <span className="tab__sub">{m.tabSub}</span>
                            <kbd className="tab__key" aria-hidden="true">
                              {i + 1}
                            </kbd>
                            {isStream && i === index && (
                              <span className="tab__timer" aria-hidden="true" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </nav>
          </div>
        </div>
      </article>
    </main>
  );
}
