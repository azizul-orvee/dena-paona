import type { Metadata } from "next";
import Link from "next/link";

import {
  CONTACT_EMAIL,
  LegalPage,
  LegalSection,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Dena-Paona collects, why, and what you can do about it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 October 2026"
      intro={
        <p>
          Dena-Paona is a private ledger for money between friends and family.
          This page explains, in plain words, what we store, why, and who can
          see it. The short version: we keep only what the app needs, we never
          sell it, and nobody sees your ledger unless you share it.
        </p>
      }
    >
      <LegalSection title="What we collect">
        <p>
          <strong>From your Google account</strong>, when you sign in: your
          name, email address and profile picture. We don&apos;t ask for access
          to your Gmail, contacts, Drive or anything else.
        </p>
        <p>
          <strong>What you type into the app</strong>: each dena or paona entry
          — the other person&apos;s name, the amount, part payments, and,
          only if you add them, their phone number, address, a note and a due
          date. Plus the email addresses of anyone you share your wallet with.
        </p>
        <p>
          <strong>To keep you signed in and the service safe</strong>: a
          session cookie, and with each sign-in session your IP address and
          browser type. We also count requests per IP address to stop abuse.
        </p>
        <p>
          We don&apos;t use advertising, tracking pixels or third-party
          analytics.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <ul>
          <li>To sign you in and keep your account yours.</li>
          <li>To show you your ledger, totals and who owes what.</li>
          <li>
            To let people you&apos;ve chosen view your wallet, and to show you
            wallets others have shared with you.
          </li>
          <li>To protect the service from abuse and fix problems.</li>
        </ul>
        <p>
          That&apos;s it. We don&apos;t sell your data, rent it, or use it for
          ads.
        </p>
      </LegalSection>

      <LegalSection title="Google user data">
        <p>
          Dena-Paona&apos;s use and transfer of information received from
          Google APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We use your Google name,
          email and picture only to create and identify your account, and
          never to serve ads or for any other purpose.
        </p>
      </LegalSection>

      <LegalSection title="Who can see your data">
        <ul>
          <li>
            <strong>You.</strong> Your ledger is private by default.
          </li>
          <li>
            <strong>People you share with.</strong> If you give someone access
            to your wallet, they can see every entry in it — including any
            phone numbers, addresses and notes you&apos;ve saved. They can&apos;t
            change anything. You can remove their access at any time.
          </li>
          <li>
            <strong>Our service providers</strong>, only to run the app: Vercel
            (hosting) and Neon (database). Their servers may be outside
            Bangladesh.
          </li>
          <li>
            <strong>Authorities</strong>, only if the law requires it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Other people's details">
        <p>
          When you add someone to your ledger, you&apos;re storing information
          about them. Please only add what you actually need, and only share
          your wallet with people you trust with those details.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Your account and entries stay until you delete them or ask us to
          delete your account. Deleting an entry removes it straight away.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul>
          <li>Edit or delete any entry from inside the app.</li>
          <li>Remove anyone&apos;s access to your wallet at any time.</li>
          <li>
            Revoke Dena-Paona&apos;s access to your Google account from your{" "}
            <a
              href="https://myaccount.google.com/connections"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Account settings
            </a>
            .
          </li>
          <li>
            Ask for a copy of your data, or for your account and everything in
            it to be deleted, by emailing{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We&apos;ll
            do it within 30 days.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data travels over HTTPS, sign-in goes through Google, and every
          request is checked so you can only reach your own wallet or ones
          shared with you. No system is perfectly secure, but we take
          reasonable care to protect what you store.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Dena-Paona isn&apos;t meant for children under 13, and we don&apos;t
          knowingly collect their data.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If we change this policy, we&apos;ll update the date at the top. For
          anything significant, we&apos;ll let you know in the app. See also
          our <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
