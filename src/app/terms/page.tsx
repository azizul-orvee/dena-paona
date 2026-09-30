import type { Metadata } from "next";
import Link from "next/link";

import {
  CONTACT_EMAIL,
  LegalPage,
  LegalSection,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Dena-Paona.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="1 October 2026"
      intro={
        <p>
          These terms are the agreement between you and Dena-Paona. By signing
          in, you accept them. We&apos;ve kept them short and readable.
        </p>
      }
    >
      <LegalSection title="What Dena-Paona is">
        <p>
          A free tool for keeping your own record of money you owe (dena) and
          money you&apos;re owed (paona). It&apos;s a notebook, not a bank:{" "}
          <strong>
            no money moves through Dena-Paona, and it doesn&apos;t collect,
            enforce or guarantee any debt.
          </strong>{" "}
          It isn&apos;t financial, legal or tax advice.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <ul>
          <li>You sign in with your Google account.</li>
          <li>
            You&apos;re responsible for what happens under your account, so
            keep your Google account secure.
          </li>
          <li>You need to be at least 13 to use Dena-Paona.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your records">
        <ul>
          <li>
            What you enter is yours. You&apos;re responsible for keeping it
            accurate — Dena-Paona just stores and adds up what you type.
          </li>
          <li>
            When you store someone else&apos;s details (name, phone, address),
            you confirm you have a fair reason to, and you&apos;ll handle them
            respectfully.
          </li>
          <li>
            When you share your wallet, the person you choose can see
            everything in it. Only share with people you trust.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Please don't">
        <ul>
          <li>Use Dena-Paona for anything illegal, or to harass anyone.</li>
          <li>Try to access other people&apos;s wallets or accounts.</li>
          <li>
            Attack, overload, scrape or reverse-engineer the service, or get
            around its limits.
          </li>
        </ul>
        <p>
          We may suspend or close accounts that break these rules.
        </p>
      </LegalSection>

      <LegalSection title="The service">
        <p>
          Dena-Paona is free and provided &ldquo;as is&rdquo;. We work to keep
          it running and your data safe, but we can&apos;t promise it will
          always be available or error-free. We may change, pause or stop
          features, and will give reasonable notice before shutting down the
          service so you can take your records with you.
        </p>
      </LegalSection>

      <LegalSection title="Limits of our responsibility">
        <p>
          As far as the law allows, Dena-Paona isn&apos;t liable for losses
          arising from how you use it — including disputes between you and the
          people in your ledger, mistakes in what was entered, or the service
          being unavailable. Keep your own copy of anything important.
        </p>
      </LegalSection>

      <LegalSection title="Leaving">
        <p>
          You can stop using Dena-Paona any time. To have your account and all
          its data deleted, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          How we handle your data is described in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Changes and governing law">
        <p>
          We may update these terms; the date at the top shows the latest
          version, and we&apos;ll tell you in the app about significant
          changes. Continuing to use Dena-Paona means you accept them. These
          terms are governed by the laws of Bangladesh.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
