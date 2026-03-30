/**
 * English and Farsi copy for the header/hero and petition statement only.
 * Statement content includes a heading and paragraphs with optional inline links.
 * Edit the objects below to change displayed text.
 */

import { STATEMENT_LINKS as L } from "./statement-links";

export type Lang = "en" | "fa";

/** Segment within a statement paragraph: plain text or a hyperlink. */
export type StatementSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

export type StatementContent = {
  heading: string;
  paragraphs: StatementSegment[][];
};

export const translations = {
  en: {
    hero: {
      siteTitle: "Stop the War on Iran",
      titleStop: "Stop",
      titleIran: "Iran",
      titleWar: "War",
      subtitle: "Urgent petition to stop the war on Iran",
      signaturesLabel: "signatures",
      ctaButton: "Sign the Petition",
    },
    statement: {
      heading: "Stop the Aggression on Iran Immediately",
      paragraphs: [
        [
          {
            type: "text",
            value:
              "We, members of the intellectual, scientific, and professional community as well as concerned citizens, condemn the unprovoked attacks by Israel and the United States on Iran. We view the war on Iran, which began with the ",
          },
          {
            type: "link",
            value: "killing of more than 150 innocent primary school girls in Minab",
            href: L.minab,
          },
          {
            type: "text",
            value:
              " and has continued with threats to the country's territorial integrity, the destruction of infrastructure, and the killing and endangerment of innocent lives, as ",
          },
          {
            type: "link",
            value: "a grave violation of fundamental moral principles and international law",
            href: L.graveViolation,
          },
          {
            type: "text",
            value: ". These actions, including attacks on ",
          },
          { type: "link", value: "residential buildings", href: L.residentialBuildings },
          { type: "text", value: ", " },
          { type: "link", value: "hospitals", href: L.hospitals },
          { type: "text", value: ", " },
          { type: "link", value: "emergency facilities", href: L.emergencyFacilities },
          { type: "text", value: ", " },
          { type: "link", value: "cultural sites", href: L.culturalSites },
          { type: "text", value: ", and " },
          { type: "link", value: "sports complexes", href: L.sportsComplexes },
          {
            type: "text",
            value:
              ", have placed countless lives at risk and undermined the protection owed to civilians.",
          },
        ],
        [
          {
            type: "text",
            value:
              "Israel and the United States launched this latest round of aggression on Iran while negotiations were still underway. Such actions are unjust, and contrary to human values and international law. We call for the immediate end of this aggression and for full justice and redress for those who have been harmed.",
          },
        ],
      ],
    },
  },
  fa: {
    hero: {
      siteTitle: "جنگ با ایران را متوقف کنید",
      titleStop: "متوقف",
      titleIran: "ایران",
      titleWar: "جنگ",
      subtitle: "کارزاری برای توقف فوری جنگ علیه ایران",
      signaturesLabel: "امضا",
      ctaButton: "امضای کارزار",
    },
    statement: {
      heading: "توقف فوری تجاوز علیه ایران",
      paragraphs: [
        [
          {
            type: "text",
            value:
              "ما، اعضای جامعهٔ دانشگاهی، علمی و حرفه‌ای، و همچنین شهروندان دغدغه‌مند، حملات غیرقابل‌توجیه و خودسرانه‌ی اسرائیل و ایالات متحده علیه ایران را محکوم می‌کنیم. ما جنگ علیه ایران را، که با ",
          },
          {
            type: "link",
            value: "کشتن بیش از ۱۵۰ دختر بی‌گناه دبستانی در میناب",
            href: L.minab,
          },
          {
            type: "text",
            value:
              " آغاز شد و با تهدید تمامیت ارضی کشور، تخریب زیرساخت‌ها و کشتن و به‌خطر انداختن جان‌های بی‌گناه ادامه یافت، ",
          },
          {
            type: "link",
            value: "نقض آشکار اصول بنیادین اخلاقی و حقوق بین‌الملل",
            href: L.graveViolation,
          },
          {
            type: "text",
            value: " می‌دانیم. این اقدامات، از جمله حملات به ",
          },
          {
            type: "link",
            value: "ساختمان‌های مسکونی",
            href: L.residentialBuildings,
          },
          { type: "text", value: "، " },
          { type: "link", value: "بیمارستان‌ها", href: L.hospitals },
          { type: "text", value: "، " },
          { type: "link", value: "تأسیسات امدادی", href: L.emergencyFacilities },
          { type: "text", value: "، " },
          { type: "link", value: "اماکن فرهنگی", href: L.culturalSites },
          { type: "text", value: " و " },
          { type: "link", value: "مجموعه‌های ورزشی", href: L.sportsComplexes },
          {
            type: "text",
            value:
              "، جان افراد بیشماری را به خطر انداخته و حمایت از غیرنظامیان را تضعیف کرده است.",
          },
        ],
        [
          {
            type: "text",
            value:
              "اسرائیل و ایالات متحده این دور جدید از تجاوز علیه ایران را در حالی آغاز کردند که مذاکرات همچنان در جریان بود. چنین اقداماتی ناعادلانه، غیرقانونی و مغایر با حقوق بین‌الملل است و ما خواستار توقف فوری این تجاوز و عدالت کامل و جبران خسارت برای تمام آسیب‌دیدگان هستیم.",
          },
        ],
      ],
    },
  },
} as const;
