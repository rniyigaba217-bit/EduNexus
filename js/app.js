const App = (() => {

  const titles = {
    dashboard:'Dashboard', courses:'My Courses', materials:'Learning Materials',
    exams:'Exams & Tests', grades:'My Grades', chat:'Chat Rooms',
    reviews:'Reviews & Feedback', 'ai-advisor':'AI Learning Advisor',
    'fac-materials':'Learning Materials', 'exam-create':'Create Exam',
    'grade-papers':'Grade Written Papers', gradebook:'Gradebook',
    students:'Students', facilitators:'Facilitators', departments:'Departments',
    analytics:'Analytics', universities:'Universities', admins:'Admin Management',
    'school-analysis':'Performance by School', 'dept-analysis':'Performance by Department',
    'course-analysis':'Performance by Course', complaints:'Complaints & Reviews',
    trends:'National Trends',
    'sd-departments':'Departments', 'sd-staff':'Staff & Facilitators',
    'sd-students':'Students', 'sd-reviews':'Reviews & Feedback',
    'sd-reports':'Performance Reports',
    'attendance':'Attendance', 'stu-attendance':'My Attendance',
    'fac-assignments':'Assignments', 'assignments':'Assignments',
    'announcements':'Announcements',
    'sys-log':'System Log',
    'doc-requests':'Document Requests',
    'stu-docs':'My Documents',
    'analytics':'Operations Overview',
    'timetable':'Timetable',
    'notif-center':'Notification Centre',
    'messages':'Messages',
    'counseling':'Counseling & Wellbeing',
  };

  const views = {};

  function register(pageId, renderFn) {
    views[pageId] = renderFn;
  }

  function navigate(page) {
    State.currentPage = page;
    Nav.setActive(page);
    Notifications.close();
    document.getElementById('page-title').textContent = titles[page] || page;

    const c = document.getElementById('main-content');
    c.innerHTML = '';

    if (views[page]) {
      views[page](c);
    } else {
      c.innerHTML = Utils.empty(`Page "${page}" not found`);
    }
  }

  function init() {
    // emailjs.init('YOUR_PUBLIC_KEY');
    console.log('EduNexus ready 🎓');
  }

  init();

  return { navigate, register };
})();
