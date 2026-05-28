/**
 * Seed Script — Populates MongoDB with demo data for all 10 colleges.
 * Run with: npm run seed
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to bypass potential ISP blocks on SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require('./db');
const College = require('./College');
const User = require('./User');
const TestAttempt = require('./TestAttempt');
const Interview = require('./Interview');
const Placement = require('./Placement');

const colleges = [
  { name: 'Karpagam Academy of Higher Education', shortCode: 'KAHE', location: 'Coimbatore', departments: ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'IT'] },
  { name: 'A.G. Arts and Science College', shortCode: 'AGASC', location: 'Coimbatore', departments: ['CSE', 'Commerce', 'BCA', 'Mathematics'] },
  { name: 'VET Institute of Arts and Science College', shortCode: 'VET', location: 'Coimbatore', departments: ['CSE', 'BCA', 'Commerce', 'English'] },
  { name: 'PSGR Krishnammal College for Women', shortCode: 'PSGR', location: 'Coimbatore', departments: ['CSE', 'BCA', 'Commerce', 'Mathematics', 'English'] },
  { name: 'PSG College of Technology', shortCode: 'PSGTECH', location: 'Coimbatore', departments: ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'IT', 'Production'] },
  { name: 'RVS College of Arts and Science', shortCode: 'RVSAS', location: 'Coimbatore', departments: ['CSE', 'IT', 'Commerce', 'Mathematics'] },
  { name: 'CMS College of Science and Commerce', shortCode: 'CMS', location: 'Coimbatore', departments: ['CSE', 'Commerce', 'BCA', 'Physics'] },
  { name: 'Karpagam College of Engineering', shortCode: 'KCE', location: 'Coimbatore', departments: ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE'] },
  { name: 'RVS College of Engineering and Technology', shortCode: 'RVSCET', location: 'Coimbatore', departments: ['CSE', 'ECE', 'Mechanical', 'EEE'] },
  { name: 'SKASC', shortCode: 'SKASC', location: 'Coimbatore', departments: ['CSE', 'BCA', 'Commerce', 'English', 'Tamil'] },
  { name: 'KCW', shortCode: 'KCW', location: 'Coimbatore', departments: ['CSE', 'BCA', 'Commerce', 'Mathematics'] },
  { name: 'NIRMALA COLLEGE FOR WOMEN', shortCode: 'NCW', location: 'Coimbatore', departments: ['CSE', 'BCA', 'Commerce', 'English', 'Mathematics'] }
];

const firstNames = ['Kaviarasan', 'Sneha', 'Arun', 'Priya', 'Rajesh', 'Divya', 'Suresh', 'Lakshmi', 'Vikram', 'Anitha', 'Deepak', 'Meena', 'Karthik', 'Swathi', 'Manoj', 'Nithya', 'Ganesh', 'Revathi', 'Sathish', 'Pooja'];
const lastNames = ['M', 'R', 'S', 'K', 'P', 'V', 'N', 'B', 'T', 'D', 'G', 'L', 'J', 'A', 'H'];
const companies = ['TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Accenture', 'Zoho', 'Amazon', 'Google', 'Microsoft', 'Freshworks', 'Capgemini'];
const roles = ['Software Engineer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'QA Engineer', 'DevOps Engineer', 'ML Intern', 'Full Stack Developer'];
const weakAreaPool = ['Data Interpretation', 'Permutations', 'Time & Work', 'Probability', 'Seating Arrangement', 'Blood Relations', 'Coding & Decoding', 'Reading Comprehension'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randNum(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seed() {
  await connectDB();
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    College.deleteMany({}),
    User.deleteMany({}),
    TestAttempt.deleteMany({}),
    Interview.deleteMany({}),
    Placement.deleteMany({})
  ]);

  // 1. Create Colleges
  console.log('🏫 Creating colleges...');
  const createdColleges = await College.insertMany(colleges);
  console.log(`   ✅ ${createdColleges.length} colleges created`);

  // 2. Create Super Admin
  console.log('👑 Creating super admin...');
  await User.create({
    name: 'Platform Admin',
    email: 'admin@skillovate.com',
    passwordHash: 'admin123',
    role: 'super_admin',
    collegeId: createdColleges[0]._id // placeholder
  });

  // 3. Create users per college
  let totalStudents = 0;
  let totalTests = 0;
  let totalInterviews = 0;
  let totalPlacements = 0;

  for (const college of createdColleges) {
    console.log(`\n📚 Seeding ${college.shortCode}...`);

    // College Admin
    await User.create({
      name: `${college.shortCode} Admin`,
      email: `admin@${college.shortCode.toLowerCase()}.edu`,
      passwordHash: 'college123',
      role: 'college_admin',
      collegeId: college._id
    });

    // Faculty
    await User.create({
      name: `${college.shortCode} Faculty`,
      email: `faculty@${college.shortCode.toLowerCase()}.edu`,
      passwordHash: 'faculty123',
      role: 'faculty',
      collegeId: college._id,
      department: college.departments[0]
    });

    // Students — 15 per college for demo
    const studentsPerCollege = 15;
    const students = [];

    for (let i = 1; i <= studentsPerCollege; i++) {
      const dept = rand(college.departments);
      const yr = randNum(2024, 2027);
      const sid = `${yr % 100}${dept.substring(0, 2).toUpperCase()}${String(i).padStart(3, '0')}`;
      const fn = rand(firstNames);
      const ln = rand(lastNames);

      students.push({
        studentId: sid,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${sid.toLowerCase()}@${college.shortCode.toLowerCase()}.edu`,
        passwordHash: 'student123',
        role: 'student',
        collegeId: college._id,
        department: dept,
        year: yr,
        skills: ['Aptitude', 'Communication', rand(['Python', 'Java', 'JavaScript', 'C++', 'SQL'])],
        stats: {
          testsCompleted: randNum(0, 12),
          avgAccuracy: randNum(45, 95),
          interviewsCompleted: randNum(0, 5),
          streak: randNum(0, 14),
          nationalRank: randNum(50, 5000)
        }
      });
    }

    const createdStudents = await User.insertMany(students);
    totalStudents += createdStudents.length;
    console.log(`   👩‍🎓 ${createdStudents.length} students created`);

    // 4. Test Attempts — 3-6 per student
    const testAttempts = [];
    for (const student of createdStudents) {
      const numTests = randNum(3, 6);
      for (let t = 0; t < numTests; t++) {
        const maxScore = 50;
        const score = randNum(15, 48);
        testAttempts.push({
          studentId: student._id,
          collegeId: college._id,
          testType: rand(['aptitude', 'mnc_simulation']),
          testName: rand(['Full Mock Test', 'Quick Quiz', 'Company Pattern Test']) + ` #${t + 1}`,
          companyName: rand(companies),
          score,
          maxScore,
          percentage: Math.round((score / maxScore) * 100),
          timeTaken: randNum(1200, 5400),
          weakAreas: [rand(weakAreaPool), rand(weakAreaPool)].filter((v, i, a) => a.indexOf(v) === i),
          passed: score >= 25,
          attemptNumber: t + 1,
          createdAt: new Date(Date.now() - randNum(1, 90) * 86400000)
        });
      }
    }
    await TestAttempt.insertMany(testAttempts);
    totalTests += testAttempts.length;
    console.log(`   📝 ${testAttempts.length} test attempts created`);

    // 5. Interviews — 1-3 per student
    const interviews = [];
    for (const student of createdStudents) {
      const numIV = randNum(1, 3);
      for (let iv = 0; iv < numIV; iv++) {
        interviews.push({
          studentId: student._id,
          collegeId: college._id,
          role: rand(roles),
          category: rand(['tech', 'hr', 'commerce']),
          overallRating: (randNum(40, 95) / 10).toFixed(1),
          strengths: [rand(['Communication', 'Technical Depth', 'Confidence', 'Problem Solving'])],
          improvements: [rand(['Time Management', 'STAR Structure', 'Quantify Results'])],
          duration: randNum(300, 1200),
          attemptNumber: iv + 1,
          createdAt: new Date(Date.now() - randNum(1, 60) * 86400000)
        });
      }
    }
    await Interview.insertMany(interviews);
    totalInterviews += interviews.length;
    console.log(`   🎤 ${interviews.length} interviews created`);

    // 6. Placements — ~30% of students
    const placedStudents = createdStudents.filter(() => Math.random() < 0.3);
    const placements = placedStudents.map(student => ({
      studentId: student._id,
      collegeId: college._id,
      companyName: rand(companies),
      role: rand(roles),
      salaryLPA: parseFloat((randNum(35, 160) / 10).toFixed(1)),
      workType: rand(['onsite', 'remote', 'hybrid']),
      mode: rand(['campus', 'off_campus']),
      location: rand(['Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Remote']),
      offerDate: new Date(Date.now() - randNum(1, 120) * 86400000),
      status: 'placed',
      verificationStatus: rand(['pending', 'verified']),
      createdAt: new Date(Date.now() - randNum(1, 120) * 86400000)
    }));

    if (placements.length > 0) {
      await Placement.insertMany(placements);
      totalPlacements += placements.length;
      console.log(`   🎉 ${placements.length} placements created`);
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('✅ SEED COMPLETE');
  console.log(`   🏫 ${createdColleges.length} colleges`);
  console.log(`   👩‍🎓 ${totalStudents} students`);
  console.log(`   📝 ${totalTests} test attempts`);
  console.log(`   🎤 ${totalInterviews} interviews`);
  console.log(`   🎉 ${totalPlacements} placements`);
  console.log('════════════════════════════════════════\n');

  console.log('🔑 Demo Credentials:');
  console.log('   Super Admin:  admin@skillovate.com / admin123');
  console.log('   College Admin: admin@kahe.edu / college123');
  console.log('   Faculty:      faculty@kahe.edu / faculty123');
  console.log('   Student:      (check DB) / student123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
