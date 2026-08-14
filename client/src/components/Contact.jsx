import { useEffect, useState } from 'react';
import { PiWhatsappLogo, PiEnvelopeSimple } from 'react-icons/pi';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        if (!res.ok) throw new Error();
        setLandlord(await res.json());
      } catch {
        setError(true);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  if (error) {
    return (
      <p className='rounded-control bg-danger-soft px-4 py-3 text-sm text-danger'>
        We could not load the owner&apos;s contact details. Please refresh the page.
      </p>
    );
  }

  if (!landlord) {
    return (
      <div className='flex flex-col gap-3' aria-hidden='true'>
        <div className='skeleton h-4 w-40 rounded-control' />
        <div className='skeleton h-24 w-full rounded-control' />
      </div>
    );
  }

  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${
    landlord.email
  }&su=${encodeURIComponent(`Regarding ${listing.name}`)}&body=${encodeURIComponent(
    message
  )}`;

  const whatsapp = `https://wa.me/${landlord.phone?.replace(
    /[^0-9]/g,
    ''
  )}?text=${encodeURIComponent(
    `Hi ${landlord.username}, I am interested in ${listing.name}. ${message}`
  )}`;

  return (
    <div className='flex flex-col gap-4'>
      <div className='field'>
        <label htmlFor='owner-message' className='label'>
          Message to {landlord.username}
        </label>
        <textarea
          id='owner-message'
          rows='4'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='input'
          placeholder='Ask about availability, deposit or a visit time.'
        />
        <p className='hint'>
          Your message is prefilled into Gmail or WhatsApp. Nothing is sent from
          this page.
        </p>
      </div>

      <div className='flex flex-col gap-2.5'>
        <a
          href={gmail}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-lg btn-primary w-full'
        >
          <PiEnvelopeSimple aria-hidden='true' className='h-[18px] w-[18px]' />
          Send by email
        </a>

        {landlord.phone?.trim() && (
          <a
            href={whatsapp}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-lg btn-secondary w-full'
          >
            <PiWhatsappLogo aria-hidden='true' className='h-[18px] w-[18px]' />
            Message on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
