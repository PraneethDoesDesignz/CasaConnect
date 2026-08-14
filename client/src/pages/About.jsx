import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PiMagnifyingGlass,
  PiHouseLine,
  PiChatCircleText,
  PiShieldCheck,
  PiEnvelopeSimple,
} from 'react-icons/pi';
import ParallaxFadeIn from '../components/ui/parallax-fadein';

// Change this to wherever project enquiries should land.
const CONTACT_EMAIL = 'sentinentdynamics@gmail.com';

const CAPABILITIES = [
  {
    icon: PiMagnifyingGlass,
    title: 'Search and filter',
    body: 'Filter listings by rent or sale, discounted price, parking and furnishing, then sort by price or recency. Filters live in the URL, so a search can be shared or bookmarked.',
  },
  {
    icon: PiHouseLine,
    title: 'Publish a property',
    body: 'Signed-in users create listings with up to six photos, price, rooms and amenities, and edit or delete them afterwards. Only the owner of a listing can change it.',
  },
  {
    icon: PiChatCircleText,
    title: 'Reach the owner',
    body: 'Enquiries open a prefilled email or WhatsApp message addressed to the person who published the listing. CasaConnect does not sit in the middle of the conversation.',
  },
  {
    icon: PiShieldCheck,
    title: 'Two ways to sign in',
    body: 'Email and password with hashed credentials and a signed JWT cookie, or Google sign-in through Firebase Authentication. Both resolve to the same account record.',
  },
];

const STACK = [
  { label: 'Interface', value: 'React, Vite, Tailwind CSS, Redux Toolkit' },
  { label: 'Server', value: 'Node.js, Express, JSON Web Tokens' },
  { label: 'Data', value: 'MongoDB with Mongoose' },
  { label: 'Integrations', value: 'Firebase Auth, Salesforce leads, Nodemailer' },
];

export default function About() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== '#contact') return;
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, [location]);

  return (
    <>
      <section className='shell max-w-3xl py-16 sm:py-24'>
        <h1 className='text-4xl font-semibold sm:text-5xl'>About CasaConnect</h1>
        <p className='mt-6 text-lg leading-relaxed text-muted'>
          CasaConnect is a property marketplace where owners publish homes for
          rent or sale and people looking for a place contact them directly.
        </p>
        <p className='mt-4 leading-relaxed text-muted'>
          It is a major academic project, not a working agency. There are no
          brokers, no verification team and no commission. Every listing and
          account you see is a real record in this application&apos;s own
          database, created by someone using the site.
        </p>
      </section>

      <ParallaxFadeIn>
        <section className='shell border-t py-16 sm:py-20'>
          <h2 className='text-2xl font-semibold sm:text-3xl'>What it does</h2>
          <div className='mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2'>
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon aria-hidden='true' className='h-6 w-6 text-accent-ink' />
                <h3 className='mt-4 font-medium'>{title}</h3>
                <p className='mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted'>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ParallaxFadeIn>

      <ParallaxFadeIn>
        <section className='shell border-t py-16 sm:py-20'>
          <div className='grid gap-10 lg:grid-cols-12 lg:gap-16'>
            <div className='lg:col-span-5'>
              <h2 className='text-2xl font-semibold sm:text-3xl'>How it is built</h2>
              <p className='mt-4 max-w-[52ch] leading-relaxed text-muted'>
                A MERN application with a React single-page client talking to an
                Express API over a proxied <code className='font-mono text-[0.875em]'>/api</code>{' '}
                route.
              </p>
            </div>

            <dl className='divide-y lg:col-span-7'>
              {STACK.map((row) => (
                <div
                  key={row.label}
                  className='flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:gap-8'
                >
                  <dt className='w-36 shrink-0 text-sm text-muted'>{row.label}</dt>
                  <dd className='text-[0.9375rem]'>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </ParallaxFadeIn>

      <ParallaxFadeIn>
        <section id='contact' className='shell scroll-mt-24 border-t py-16 sm:py-24'>
          <div className='rounded-feature border bg-sunken px-6 py-12 sm:px-12 sm:py-16'>
            <div className='max-w-xl'>
              <h2 className='text-2xl font-semibold sm:text-3xl'>Get in touch</h2>
              <p className='mt-4 leading-relaxed text-muted'>
                Asking about a specific property? Open its listing and use the
                contact panel there, which reaches the owner directly.
              </p>
              <p className='mt-3 leading-relaxed text-muted'>
                Questions about the project itself, or found a bug? Email me.
              </p>

              <div className='mt-8 flex flex-wrap gap-3'>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    'CasaConnect'
                  )}`}
                  className='btn btn-lg btn-primary'
                >
                  <PiEnvelopeSimple aria-hidden='true' className='h-[18px] w-[18px]' />
                  Email about the project
                </a>
                <Link to='/search' className='btn btn-lg btn-secondary'>
                  Browse listings
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ParallaxFadeIn>
    </>
  );
}
