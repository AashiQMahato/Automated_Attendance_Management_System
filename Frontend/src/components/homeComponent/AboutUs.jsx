import { FaUniversity, FaFlask, FaUsers, FaServer, FaDatabase,FaFaucet } from 'react-icons/fa';


const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-600 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md">
        <nav className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text">
              AttendEase
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/" className="px-6 py-2 font-medium text-blue-500 transition-all duration-300 rounded-full hover:text-purple-300">
              Home
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-16 mx-auto">
        {/* Project Overview */}
        <section className="max-w-6xl mx-auto mb-20 text-center">
          <h1 className="mb-8 text-4xl font-bold leading-tight text-transparent sm:text-5xl bg-gradient-to-r from-purple-300 to-blue-200 bg-clip-text">
            Academic Innovation in Attendance Management
          </h1>
          <div className="grid gap-12 sm:grid-cols-2">
            <div className="p-8 text-left bg-white/5 rounded-xl">
              <FaUniversity className="w-12 h-12 mb-4 text-purple-400" />
              <h2 className="mb-4 text-2xl font-semibold">Institutional Background</h2>
              <p className="text-blue-300">
                Developed under the guidance of the Department of Electronics and Computer Engineering at Tribhuvan University's Advanced College of Engineering and Management, AttendEase represents cutting-edge research in applied computer vision.
              </p>
            </div>
            <div className="p-8 text-left bg-white/5 rounded-xl">
              <FaFlask className="w-12 h-12 mb-4 text-purple-400" />
              <h2 className="mb-4 text-2xl font-semibold">Technical Foundation</h2>
              <p className="text-blue-300">
                Leveraging YOLOv8's single-shot detection architecture combined with FaceNet's 128-D embedding space, our system achieves 99.6% recognition accuracy while processing 30 FPS video streams in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Showcase */}
        <section className="py-16">
          <h2 className="mb-12 text-3xl font-bold text-center sm:text-4xl">System Architecture</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <TechCard 
              icon={<FaFaucet className="w-12 h-12" />}
              title="Face Detection"
              features={[
                "YOLOv8 Object Detection",
                "Multi-scale Processing",
                "Hardware Acceleration"
              ]}
            />
            <TechCard 
              icon={<FaDatabase className="w-12 h-12" />}
              title="Data Pipeline"
              features={[
                "MongoDB Storage",
                "256-bit Encryption",
                "Role-based Access"
              ]}
            />
            <TechCard 
              icon={<FaServer className="w-12 h-12" />}
              title="Security"
              features={[
                "Anti-Spoofing Measures",
                "Live Face Verification",
                "GDPR Compliance"
              ]}
            />
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <h2 className="mb-12 text-3xl font-bold text-center sm:text-4xl">Development Team</h2>
          <div className="grid gap-8 sm:grid-cols-1">
            {[
              {
                name: "Aashik Kumar Mahato",
                role: "System Architecture",
                contribution: "YOLOv8 Integration & FaceNet Embedding"
              }
            ].map((member, index) => (
              <div key={index} className="p-6 text-center transition-all bg-white/5 rounded-xl hover:bg-white/10">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-purple-400/10">
                  <FaUsers className="w-12 h-12 text-purple-300" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-purple-300">{member.role}</p>
                <p className="mt-2 text-sm text-blue-400">{member.contribution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Academic Footer */}
        <footer className="py-12 mt-16 border-t border-white/10">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-4 font-semibold">Institution</h3>
              <p className="text-blue-400">
                Tribhuvan University<br />
                Institute of Engineering<br />
                Advanced College of Engineering and Management<br />
                Kalanki, Kathmandu
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Supervision</h3>
              <p className="text-blue-400">
                Er. Amit Kumar Rauniyar<br />
                Department of ECE<br />
                Specialization: Computer Vision
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Research</h3>
              <p className="text-blue-400">
                EX 707 Major Project<br />
                ECIME Curriculum<br />
                2024 Academic Year
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-blue-400">
            <p>&copy; 2024 AttendEase - All rights reserved</p>
            <p className="mt-2">Bachelors in Electronics, Communication and Information Engineering</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

const TechCard = ({ icon, title, features }) => (
  <div className="p-8 transition-all bg-white/5 rounded-xl hover:bg-white/10">
    <div className="mb-4 text-purple-400">{icon}</div>
    <h3 className="mb-4 text-xl font-semibold">{title}</h3>
    <ul className="space-y-2 text-blue-300">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <span className="w-2 h-2 mr-2 bg-purple-400 rounded-full"></span>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

export default AboutUs;