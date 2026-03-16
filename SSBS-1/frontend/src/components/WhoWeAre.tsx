import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const S = {
  bg: '#0A0C10',
  bg3: '#161B27',
  line: 'rgba(255,255,255,0.06)',
  sky: '#3B82F6',
  sky2: '#60A5FA',
  muted: '#94A3B8',
  dim: '#64748B',
} as const;

interface TeamMember {
  name: string;
  initials: string;
  role: string;
  desc: string;
  profile42: string;
  featured?: boolean;
}

const team: TeamMember[] = [
  {
    name: 'Adil Bourji',
    initials: 'AB',
    role: 'Frontend Developer',
    desc: 'Crafts the entire user interface, ensuring a seamless and responsive experience across all devices.',
    profile42: 'https://profile.intra.42.fr/users/abourji',
    featured: true,
  },
  {
    name: 'Mohamed Lahrech',
    initials: 'ML',
    role: 'Backend Developer',
    desc: 'Builds the core API services, database models, and business logic powering the platform.',
    profile42: 'https://profile.intra.42.fr/users/mlahrech',
  },
  {
    name: 'Abderrahman Chakour',
    initials: 'AC',
    role: 'Backend Developer',
    desc: 'Handles authentication, real-time notifications, and integrations with external services.',
    profile42: 'https://profile.intra.42.fr/users/achakour',
  },
  {
    name: 'Ayoub El Haouti',
    initials: 'AE',
    role: 'Testing & QA',
    desc: 'Ensures platform reliability through rigorous testing, bug fixing, and backend quality assurance.',
    profile42: 'https://profile.intra.42.fr/users/aelhaouti',
  },
  {
    name: 'Aamir Tahtah',
    initials: 'AT',
    role: 'DevOps & Security',
    desc: 'Manages deployment pipelines, infrastructure, and ensures the platform stays secure and reliable.',
    profile42: 'https://profile.intra.42.fr/users/atahtah',
  },
];

const Card = ({ m, big }: { m: TeamMember; big?: boolean }) => (
  <div
    style={{
      background: S.bg3,
      border: `1px solid ${S.line}`,
      borderRadius: 16,
      padding: big ? 32 : 24,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      transition: 'border-color 0.25s',
      cursor: 'default',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = S.line; }}
  >
    <div>
      {/* Avatar */}
      <div
        style={{
          width: big ? 64 : 48,
          height: big ? 64 : 48,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${S.sky}, ${S.sky2})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: big ? 20 : 16,
          fontFamily: "'Geist Mono', monospace",
          fontSize: big ? 22 : 16,
          fontWeight: 700,
          color: 'white',
        }}
      >
        {m.initials}
      </div>

      {/* Role tag */}
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.15)',
          color: S.sky2,
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '3px 10px',
          borderRadius: 100,
          marginBottom: 12,
        }}
      >
        {m.role}
      </span>

      {/* Name */}
      <h3
        style={{
          fontSize: big ? 22 : 17,
          fontWeight: 700,
          color: 'white',
          marginBottom: 8,
          letterSpacing: '-0.01em',
        }}
      >
        {m.name}
      </h3>

      {/* Desc */}
      <p
        style={{
          fontSize: big ? 14 : 13,
          fontWeight: 300,
          color: S.muted,
          lineHeight: 1.65,
        }}
      >
        {m.desc}
      </p>
    </div>

    {/* 42 link */}
    <a
      href={m.profile42}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 mt-5"
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: S.dim,
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = S.sky2; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = S.dim; }}
    >
      <span style={{
        width: 18, height: 18, borderRadius: 4,
        background: 'rgba(255,255,255,0.08)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: 'white',
      }}>42</span>
      View profile →
    </a>
  </div>
);

const WhoWeAre = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const featured = team.find((m) => m.featured)!;
  const others = team.filter((m) => !m.featured);

  return (
    <section
      id="team"
      ref={ref}
      style={{
        background: S.bg,
        padding: '72px 20px',
        fontFamily: "'Geist', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14"
        >
          <div>
            <div className="flex items-center gap-2 mb-5" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.sky2 }}>
              <span style={{ width: 16, height: 1, background: S.sky2 }} />
              Team
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 3vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'white' }}>
              Built by <em style={{ fontStyle: 'normal', color: S.sky2 }}>1337 students</em>,<br />
              for 1337 students.
            </h2>
          </div>
          <p className="md:text-right" style={{ maxWidth: 280, fontSize: 14, fontWeight: 300, color: S.muted, lineHeight: 1.6 }}>
            A small team of peers who decided waiting for the shuttle shouldn't be this stressful.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 1,
            background: S.line,
            borderRadius: 20,
            overflow: 'hidden',
            border: `1px solid ${S.line}`,
          }}
        >
          {/* Featured card — spans 2 rows on larger screens */}
          <motion.div
            className="md:row-span-2"
            style={{ background: S.bg }}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card m={featured} big />
          </motion.div>

          {/* Other cards */}
          {others.map((m, i) => (
            <motion.div
              key={m.name}
              style={{ background: S.bg }}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <Card m={m} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre;
