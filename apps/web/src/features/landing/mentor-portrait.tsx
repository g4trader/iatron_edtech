import Image from 'next/image';
import s from './landing.module.css';

type OfficialPortrait = { src: string; alt: string };

/** Accepts an authorized local portrait when supplied; initials are the current identity. */
export function MentorPortrait({
  name,
  initials,
  photo,
}: {
  name: string;
  initials: string;
  photo?: OfficialPortrait;
}) {
  return (
    <div className={s.mentorMark}>
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 767px) 90vw, 25vw"
          className={s.mentorPhoto}
        />
      ) : (
        <div className={s.mentorInitials} aria-hidden="true">
          <span>MENTOR IATRON</span>
          <strong>{initials}</strong>
          <span>{name.replace('Dr. ', '')}</span>
        </div>
      )}
    </div>
  );
}
