import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);
  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows="2"
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
              landlord.email
            }&su=Regarding ${listing.name}&body=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
          >
            Send Message via Gmail
          </a>
          {landlord.phone && landlord.phone.trim() !== "" && (
            <a
              href={`https://wa.me/${landlord.phone.replace(
                /[^0-9]/g,
                ""
              )}?text=${encodeURIComponent(
                `Hi ${landlord.username}, I am interested in ${listing.name}. ${message}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white text-center p-3 uppercase rounded-lg hover:opacity-95 mt-2 w-1/2 mx-auto font-bold"
            >
              <FaWhatsapp size={24} />
              Contact via WhatsApp
            </a>
          )}
        </div>
      )}
    </>
  );
}
