/**
 * EduNexus — state.js
 * Central data model. All views read from and write to State.*
 * In production replace mock data with Supabase queries.
 */

const State = (() => {

  /* ── Current session ─────────────────────────── */
  let currentRole = 'student';
  let currentPage = '';
  let aiHistory   = [];
  let activeChatRoom = 'cs-general';
  let anonMode    = false;
  let modalTimer  = null;
  let modalSecs   = 5400;
  let qCount      = 1;
  let _profile    = null;  // set from Firestore after login

  /* ── Role profiles ───────────────────────────── */
  const roles = {
    student:      { name:'Alex Johnson',    role:'Student · CS Dept',    uni:'University of Technology',  avatar:'AJ', color:'#6c63ff' },
    facilitator:  { name:'Dr. Sarah Williams', role:'Facilitator · CS Dept', uni:'University of Technology', avatar:'SW', color:'#00d4aa' },
    'uni-admin':  { name:'Prof. Mark Davis',role:'University Admin',      uni:'University of Technology',  avatar:'MD', color:'#ffd166' },
    'super-admin':{ name:'System Admin',    role:'Super Administrator',   uni:'EduNexus Platform',         avatar:'SA', color:'#ff6b6b' },
    ministry:          { name:'Dr. Amina Kone',  role:'Ministry of Education', uni:'Ministry Dashboard',        avatar:'AK', color:'#ce93d8' },
    'school-director': { name:'Dr. Fatima Osei', role:'School Director',        uni:'University of Technology',  avatar:'FO', color:'#38bdf8' },
  };

  /* ── Nav config ──────────────────────────────── */
  const navConfig = {
    student: [
      { section:'Learning' },
      { id:'dashboard',   label:'Dashboard',          icon:'🏠' },
      { id:'courses',     label:'My Courses',         icon:'📚' },
      { id:'materials',   label:'Learning Materials', icon:'📄' },
      { id:'exams',       label:'Exams & Tests',      icon:'📝' },
      { id:'grades',      label:'My Grades',          icon:'📊' },
      { section:'Community' },
      { id:'chat',        label:'Chat Rooms',         icon:'💬' },
      { id:'reviews',     label:'Reviews',            icon:'⭐' },
      { section:'AI' },
      { id:'ai-advisor',  label:'AI Learning Advisor',icon:'🤖' },
    ],
    facilitator: [
      { section:'Teaching' },
      { id:'dashboard',     label:'Dashboard',          icon:'🏠' },
      { id:'fac-materials', label:'Learning Materials', icon:'📄' },
      { id:'exam-create',   label:'Create Exam',        icon:'✏️' },
      { id:'grade-papers',  label:'Grade Papers',       icon:'📋' },
      { id:'gradebook',     label:'Gradebook',          icon:'📊' },
      { section:'Communication' },
      { id:'chat',          label:'Chat Rooms',         icon:'💬' },
      { id:'reviews',       label:'Reviews',            icon:'⭐' },
    ],
    'uni-admin': [
      { section:'Administration' },
      { id:'dashboard',    label:'Dashboard',    icon:'🏠' },
      { id:'students',     label:'Students',     icon:'👥' },
      { id:'facilitators', label:'Facilitators', icon:'👨‍🏫' },
      { id:'departments',  label:'Departments',  icon:'🏛️' },
      { id:'analytics',    label:'Analytics',    icon:'📈' },
      { section:'Platform' },
      { id:'reviews',      label:'Feedback & Reviews', icon:'⭐' },
      { id:'chat',         label:'Chat Rooms',         icon:'💬' },
    ],
    'super-admin': [
      { section:'Platform' },
      { id:'dashboard',    label:'Dashboard',          icon:'🏠' },
      { id:'universities', label:'Universities',       icon:'🏫' },
      { id:'students',     label:'All Students',       icon:'👥' },
      { id:'analytics',    label:'Platform Analytics', icon:'📈' },
      { section:'Administration' },
      { id:'admins',       label:'Admins',             icon:'🔑' },
      { id:'reviews',      label:'All Feedback',       icon:'⭐' },
    ],
    ministry: [
      { section:'Ministry Overview' },
      { id:'dashboard',       label:'Overview Dashboard',  icon:'🏠' },
      { id:'school-analysis', label:'By School',           icon:'🏫' },
      { id:'dept-analysis',   label:'By Department',       icon:'🏛️' },
      { id:'course-analysis', label:'By Course',           icon:'📚' },
      { id:'complaints',      label:'Complaints & Reviews',icon:'📋' },
      { id:'trends',          label:'National Trends',     icon:'📈' },
    ],
    'school-director': [
      { section:'School Overview' },
      { id:'dashboard',      label:'Dashboard',              icon:'🏠' },
      { id:'sd-departments', label:'Departments',            icon:'🏛️' },
      { id:'sd-staff',       label:'Staff & Facilitators',   icon:'👨‍🏫' },
      { id:'sd-students',    label:'Students',               icon:'👥' },
      { section:'Insights' },
      { id:'sd-reviews',     label:'Reviews & Feedback',     icon:'⭐' },
      { id:'sd-reports',     label:'Performance Reports',    icon:'📊' },
      { section:'Communication' },
      { id:'chat',           label:'Chat Rooms',             icon:'💬' },
    ],
  };

  /* ── Chat messages (mock) ────────────────────── */
  const chatMessages = {
    'directors': [
      { user:'Dr. Fatima Osei',  text:'Arts dept pass rate is a concern this term — anyone else seeing similar patterns?', anon:false, time:'09:10' },
      { user:'Dr. Mensah',       text:'Same here with Southern Polytech. We\'re trialling peer-tutoring sessions next week.', anon:false, time:'09:18' },
      { user:'Prof. Tanaka',     text:'Business School has had good results pairing at-risk students with senior mentors.', anon:false, time:'09:25' },
      { user:'Dr. Fatima Osei',  text:'Worth a pilot. I\'ll raise it in the ministry review on Friday.', anon:false, time:'09:31' },
    ],
    'admin-channel': [
      { user:'Prof. Mark Davis', text:'Timetables for Term 3 are being finalised — please send dept conflicts by Thursday.', anon:false, time:'08:00' },
      { user:'Dr. Fatima Osei',  text:'Engineering has a lab clash on Tuesday mornings. Will send details.', anon:false, time:'08:15' },
      { user:'Prof. Mark Davis', text:'Noted, I\'ll flag it to the timetable office.', anon:false, time:'08:20' },
    ],
    'cs-general': [
      { user:'Sara M.',    text:'Has anyone started the OS assignment?',         anon:false, time:'10:32' },
      { user:'Anonymous',  text:'Prof said it\'s easier than it looks',          anon:true,  time:'10:35' },
      { user:'James K.',   text:'I finished it, happy to help in study hall',    anon:false, time:'10:40' },
    ],
    'math-201': [
      { user:'Lena P.',    text:'The calculus notes from week 3 are gold',       anon:false, time:'09:15' },
      { user:'Anonymous',  text:'Anyone else think the midterm was unfair?',     anon:true,  time:'09:22' },
    ],
    'reviews': [
      { user:'Anonymous',  text:'Prof Williams explains concepts really clearly!',anon:true,  time:'Yesterday' },
      { user:'Anonymous',  text:'The lab equipment is outdated, needs upgrade',  anon:true,  time:'2 days ago' },
    ],
  };

  /* ── Students (mock) ─────────────────────────── */
  const students = [
    { name:'Alex Johnson',  id:'CS-0001', dept:'Computer Science', year:3, gpa:83.4, status:'Active' },
    { name:'Maria Santos',  id:'CS-0041', dept:'Computer Science', year:2, gpa:91.0, status:'Active' },
    { name:'James Kwame',   id:'CS-0087', dept:'Computer Science', year:4, gpa:78.2, status:'Active' },
    { name:'Priya Sharma',  id:'CS-0112', dept:'Engineering',      year:2, gpa:87.5, status:'Active' },
    { name:'Carlos Rivera', id:'CS-0156', dept:'Mathematics',      year:3, gpa:62.1, status:'At Risk' },
    { name:'Aisha Obi',     id:'CS-0203', dept:'Computer Science', year:1, gpa:93.2, status:'Active' },
  ];

  /* ── Courses (mock) ──────────────────────────── */
  const courses = [
    { code:'CS301', name:'Data Structures',      prof:'Dr. Williams', credits:3, grade:88 },
    { code:'CS302', name:'Algorithms',           prof:'Prof. Ahmed',  credits:3, grade:76 },
    { code:'CS303', name:'Operating Systems',    prof:'Dr. Patel',    credits:4, grade:91 },
    { code:'CS304', name:'Database Systems',     prof:'Dr. Kim',      credits:3, grade:70 },
    { code:'CS305', name:'Computer Networks',    prof:'Prof. Johnson',credits:3, grade:82 },
    { code:'CS306', name:'Software Engineering', prof:'Dr. Chen',     credits:4, grade:85 },
  ];

  /* ── Materials (mock) ────────────────────────── */
  const materials = [
    { icon:'📄', name:'Week 1 – Introduction to Data Structures', type:'PDF',   size:'2.4 MB', date:'Jan 12', week:'Week 1', course:'CS301' },
    { icon:'🎥', name:'Lecture: Arrays and Linked Lists (Video)',  type:'Video', size:'180 MB', date:'Jan 14', week:'Week 1', course:'CS301' },
    { icon:'📄', name:'Week 2 – Stacks and Queues Notes',         type:'PDF',   size:'1.8 MB', date:'Jan 19', week:'Week 2', course:'CS301' },
    { icon:'🔗', name:'Practice Problems – Recursion (External)', type:'Link',  size:'—',      date:'Jan 21', week:'Week 2', course:'CS301' },
    { icon:'📑', name:'Week 3 – Trees & Binary Search Trees',     type:'Slides',size:'5.1 MB', date:'Jan 26', week:'Week 3', course:'CS301' },
    { icon:'📄', name:'Week 4 – Graphs & Traversal Algorithms',   type:'PDF',   size:'3.2 MB', date:'Feb 2',  week:'Week 4', course:'CS302' },
    { icon:'🎥', name:'Lecture: Dijkstra\'s Algorithm',           type:'Video', size:'220 MB', date:'Feb 4',  week:'Week 4', course:'CS302' },
  ];

  /* ── Notifications (mock) ────────────────────── */
  const notifications = [
    { id:1, title:'New exam scheduled',  sub:'Data Structures – Monday 9am', read:false, time:'1h ago' },
    { id:2, title:'Grade posted',        sub:'Algorithms midterm: 87/100',   read:false, time:'2h ago' },
    { id:3, title:'AI Tip available',    sub:'New personalized recommendation', read:false, time:'3h ago' },
    { id:4, title:'Chat message',        sub:'#cs-general: "Anyone done the assignment?"', read:true, time:'4h ago' },
  ];

  /* ── Written papers pending grading ─────────── */
  const pendingPapers = [
    { name:'Maria Santos',  id:'2021-CS-0041', answer:'DFS uses a stack and explores as deep as possible before backtracking. BFS uses a queue and explores level by level. I would use DFS for maze solving and BFS for finding the shortest path in unweighted graphs.' },
    { name:'James Kwame',   id:'2021-CS-0087', answer:'Depth-first search goes down one path completely before trying others. BFS explores level by level. DFS is better for games like chess; BFS for shortest routes like GPS navigation.' },
    { name:'Priya Sharma',  id:'2021-CS-0112', answer:'DFS and BFS are both graph traversal algorithms. DFS goes deep using recursion or a stack. BFS uses a queue for level-order traversal. BFS guarantees shortest path in unweighted graphs.' },
  ];

  /* ── Universities ────────────────────────────── */
  const universities = [
    { name:'University of Technology',   students:4821, facilitators:183, depts:12, avg:'82%', status:'Active', admin:'Prof. Davis' },
    { name:'State Medical University',   students:2140, facilitators:98,  depts:8,  avg:'88%', status:'Active', admin:'Dr. Amara' },
    { name:'National Engineering Univ.', students:3210, facilitators:142, depts:10, avg:'79%', status:'Active', admin:'Prof. Smith' },
    { name:'Arts & Sciences University', students:1840, facilitators:76,  depts:7,  avg:'71%', status:'Active', admin:'Dr. Reyes' },
    { name:'Business School',            students:2410, facilitators:104, depts:5,  avg:'80%', status:'Active', admin:'Prof. Tanaka' },
    { name:'Southern Polytechnic',       students:1620, facilitators:88,  depts:6,  avg:'68%', status:'Active', admin:'Dr. Mensah' },
  ];

  /* ── School Director data (mock) ────────────── */
  const sdDepartments = [
    { name:'Computer Science', students:1240, staff:28, passRate:82, trend:'+2.1%', status:'Active' },
    { name:'Engineering',      students:980,  staff:24, passRate:78, trend:'+0.8%', status:'Active' },
    { name:'Mathematics',      students:720,  staff:18, passRate:74, trend:'-1.2%', status:'Watch'  },
    { name:'Business Studies', students:860,  staff:22, passRate:80, trend:'+1.5%', status:'Active' },
    { name:'Medicine',         students:540,  staff:19, passRate:88, trend:'+3.0%', status:'Active' },
    { name:'Arts & Humanities',students:481,  staff:16, passRate:71, trend:'-2.8%', status:'At Risk'},
  ];

  const sdStaff = [
    { name:'Dr. Sarah Williams',  dept:'Computer Science', students:247, courses:4, satisfaction:88, status:'Active'   },
    { name:'Prof. Ahmed Hassan',  dept:'Computer Science', students:180, courses:3, satisfaction:79, status:'Active'   },
    { name:'Dr. Anjali Patel',    dept:'Engineering',      students:165, courses:3, satisfaction:85, status:'Active'   },
    { name:'Prof. James Chen',    dept:'Engineering',      students:192, courses:4, satisfaction:77, status:'Active'   },
    { name:'Dr. Linh Nguyen',     dept:'Mathematics',      students:143, courses:3, satisfaction:82, status:'Active'   },
    { name:'Prof. Kwame Asante',  dept:'Business Studies', students:128, courses:2, satisfaction:74, status:'Review'   },
    { name:'Dr. Yemi Adeyemo',    dept:'Medicine',         students:98,  courses:2, satisfaction:91, status:'Active'   },
    { name:'Prof. Rita Okafor',   dept:'Arts & Humanities',students:112, courses:3, satisfaction:69, status:'At Risk'  },
  ];

  const sdReviewThemes = [
    { theme:'Teaching Quality',       count:342, sentiment:'mixed',    trend:'↑', pct:28 },
    { theme:'Course Content',         count:289, sentiment:'positive', trend:'→', pct:24 },
    { theme:'Facilities & Equipment', count:215, sentiment:'negative', trend:'↑', pct:18 },
    { theme:'Exam Difficulty',        count:187, sentiment:'negative', trend:'↓', pct:15 },
    { theme:'Admin Support',          count:134, sentiment:'negative', trend:'↑', pct:11 },
    { theme:'Platform Usability',     count:52,  sentiment:'positive', trend:'↓', pct:4  },
  ];

  const sdRecentReviews = [
    { stars:5, text:'Prof. Williams explains complex topics with great clarity. Best lecturer I\'ve had so far.', dept:'Computer Science', time:'2h ago' },
    { stars:2, text:'Lab equipment in Block C needs urgent maintenance. Our experiments were delayed twice this week.', dept:'Engineering', time:'5h ago' },
    { stars:3, text:'Course materials are well-organised but the reading list really needs updating to 2024 editions.', dept:'Mathematics', time:'Yesterday' },
    { stars:2, text:'Admin office response time is far too slow — took 3 weeks to resolve my academic query.', dept:'General', time:'2 days ago' },
    { stars:4, text:'The AI learning advisor is genuinely helpful for exam preparation. Keep it going!', dept:'Computer Science', time:'2 days ago' },
    { stars:1, text:'Arts department classrooms are overcrowded and the projectors are broken half the time.', dept:'Arts & Humanities', time:'3 days ago' },
  ];

  /* ── Exam question types ─────────────────────── */
  const questionTypes = [
    { value:'mcq',     label:'Multiple Choice' },
    { value:'written', label:'Written / Essay' },
    { value:'code',    label:'Code' },
    { value:'tf',      label:'True / False' },
    { value:'fill',    label:'Fill in the Blank' },
    { value:'match',   label:'Matching' },
  ];

  /* ── Public API ──────────────────────────────── */
  return {
    get currentRole()     { return currentRole; },
    set currentRole(v)    { currentRole = v; },
    get currentPage()     { return currentPage; },
    set currentPage(v)    { currentPage = v; },
    get aiHistory()       { return aiHistory; },
    set aiHistory(v)      { aiHistory = v; },
    get activeChatRoom()  { return activeChatRoom; },
    set activeChatRoom(v) { activeChatRoom = v; },
    get anonMode()        { return anonMode; },
    set anonMode(v)       { anonMode = v; },
    get modalTimer()      { return modalTimer; },
    set modalTimer(v)     { modalTimer = v; },
    get modalSecs()       { return modalSecs; },
    set modalSecs(v)      { modalSecs = v; },
    get qCount()          { return qCount; },
    set qCount(v)         { qCount = v; },

    roles,
    navConfig,
    chatMessages,
    students,
    courses,
    materials,
    notifications,
    pendingPapers,
    universities,
    questionTypes,
    sdDepartments,
    sdStaff,
    sdReviewThemes,
    sdRecentReviews,

    /* helpers */
    currentUser()    { return _profile || roles[currentRole]; },
    setProfile(p)    { _profile = p; currentRole = p.role; },
    clearProfile()   { _profile = null; },
    addNotification(title, sub) {
      notifications.unshift({ id: Date.now(), title, sub, read: false, time: 'Just now' });
    },
    addMaterial(mat) { materials.unshift(mat); },
    addChatMessage(room, msg) {
      if (!chatMessages[room]) chatMessages[room] = [];
      chatMessages[room].push(msg);
    },
  };
})();