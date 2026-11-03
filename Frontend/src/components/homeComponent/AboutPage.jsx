import { ArrowRight } from "lucide-react";
import logo from "../../assets/Logo.svg";
import { Eyebrow, Footer, Header, PointList, PrimaryLink, Reveal, SectionTitle, TextLink } from "./LandingPage";
import AmbientBackground from "../ui/AmbientBackground";

const PIPELINE = [
  { title: "Detect", body: "YOLOv8, trained for faces, finds every face in the class photo." },
  { title: "Describe", body: "FaceNet (InceptionResnetV1) turns each face into a 512-number embedding." },
  { title: "Match", body: "Each embedding is compared with enrolled students; close enough is a match." },
  { title: "Confirm", body: "The teacher reviews the roster and saves. Nothing is recorded before that." },
];

const STACK = [
  "React, Vite and Tailwind CSS for the web app",
  "Node.js, Express and MongoDB for the API and data",
  "Python and FastAPI for the face-recognition service",
  "Cloudinary for class photos and assignment files",
];

const Fact = ({ term, children }) => (
  <div className="border-t border-line-strong pt-5">
    <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-3">{term}</dt>
    <dd className="mt-2 text-[15px] leading-6 text-ink-2">{children}</dd>
  </div>
);

const AboutPage = () => (
  <div className="relative min-h-screen font-sans text-ink antialiased">
    <AmbientBackground />
    <Header />
    <main>
      <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <img src={logo} alt="" className="mx-auto h-16 w-16" />
          <h1 className="mt-8 text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[3.75rem]">
            About AttendEase
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-7 text-ink-2 sm:text-[19px] sm:leading-8">
            A final-year engineering project that turns a single class photo into an attendance roster, so class time goes to
            teaching instead of roll calls.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-line/50 bg-white/45 dark:bg-white/[0.025] px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Eyebrow>Why</Eyebrow>
            <SectionTitle className="mt-3">Roll calls are slow, and easy to fake.</SectionTitle>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-[17px] leading-7 text-ink-2">
            <p>
              Calling names takes minutes from every class, and a friend can answer for someone who isn&apos;t there. Paper
              registers then have to be typed up before anyone can see who is falling behind.
            </p>
            <p>
              AttendEase lets the teacher take one photo. The system suggests who is present, the teacher confirms, and
              students see their attendance right away, along with assignments and holidays.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle className="mt-3">From photo to roster in four steps.</SectionTitle>
          </Reveal>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PIPELINE.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <li className="border-t border-line-strong pt-6">
                  <span className="font-mono text-[13px] text-ink-3">0{i + 1}</span>
                  <h3 className="mt-3 text-[19px] font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink-2">{step.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-16 max-w-2xl">
            <h3 className="text-[19px] font-semibold tracking-tight">Built with</h3>
            <PointList items={STACK} />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line/50 bg-white/45 dark:bg-white/[0.025] px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Eyebrow>The project</Eyebrow>
            <SectionTitle className="mt-3">Made at Advanced College of Engineering and Management.</SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <Fact term="Developed by">
                <span className="font-medium text-ink">Aashik Kumar Mahato</span>
                <br />
                System architecture, YOLOv8 and FaceNet integration
              </Fact>
              <Fact term="Supervisor">
                <span className="font-medium text-ink">Er. Amit Kumar Rauniyar</span>
                <br />
                Department of Electronics and Computer Engineering
              </Fact>
              <Fact term="Institution">
                Advanced College of Engineering and Management, Kalanki, Kathmandu
                <br />
                Institute of Engineering, Tribhuvan University
              </Fact>
              <Fact term="Program">
                EX 707 Major Project, 2024
                <br />
                Bachelor&apos;s in Electronics, Communication and Information Engineering
              </Fact>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-24 text-center sm:px-6 sm:py-32">
        <Reveal className="mx-auto max-w-2xl">
          <SectionTitle>See it in action.</SectionTitle>
          <p className="mt-5 text-[17px] leading-7 text-ink-2">Students can create an account; teachers get one from the admin.</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <PrimaryLink to="/signup">
              Create account <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </PrimaryLink>
            <TextLink to="/login">Sign in</TextLink>
          </div>
        </Reveal>
      </section>
    </main>
    <Footer />
  </div>
);

export default AboutPage;
