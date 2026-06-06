const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

app.use(express.json());

// URL masing-masing service
// nama service diambil dari docker-compose (bukan localhost)
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || "http://student-service:3001";
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || "http://course-service:3002";
const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || "http://enrollment-service:3003";
const GRADE_SERVICE_URL = process.env.GRADE_SERVICE_URL || "http://grade-service:3004";

// =====================================================
// GRAPHQL SCHEMA
// Mendefinisikan tipe data dan query yang tersedia
// Client hanya bisa minta field yang ada di sini
// =====================================================
const schema = buildSchema(`
  # Tipe data Mahasiswa dari student-service
  type Student {
    _id: String
    nim: String
    nama: String
    email: String
    prodi: String
    angkatan: Int
    status: String
  }

  # Tipe data Mata Kuliah dari course-service
  type Course {
    id: Int
    course_code: String
    course_name: String
    credits: Int
    semester: Int
    is_active: Boolean
  }

  # Tipe data Enrollment dari enrollment-service
  type Enrollment {
    id: Int
    student_id: String
    course_id: String
    semester: String
    status: String
  }

  # Tipe data Nilai dari grade-service
  type Grade {
    id: Int
    student_id: String
    course_id: String
    nilai: Float
    grade: String
    semester: Int
    tahun_akademik: String
  }

  # Health check tiap service
  type ServiceHealth {
    service: String
    status: String
  }

  # Query = operasi READ (ambil data)
  type Query {
    # student queries
    students: [Student]
    student(id: String!): Student
    studentByNim(nim: String!): Student

    # course queries
    courses: [Course]
    course(id: Int!): Course

    # enrollment queries
    enrollments: [Enrollment]
    enrollmentsByStudent(studentId: String!): [Enrollment]

    # grade queries
    grades: [Grade]
    gradesByStudent(studentId: String!): [Grade]

    # health check semua service
    healthCheck: [ServiceHealth]
  }

  # Input untuk tambah mahasiswa
  input StudentInput {
    nim: String!
    nama: String!
    email: String!
    prodi: String!
    angkatan: Int!
    status: String
  }

  # Input untuk tambah mata kuliah
  input CourseInput {
    course_code: String!
    course_name: String!
    credits: Int!
    semester: Int!
  }

  # Input untuk tambah nilai
  input GradeInput {
    student_id: String!
    course_id: String!
    nilai: Float!
    grade: String!
    semester: Int!
    tahun_akademik: String!
  }

  # Mutation = operasi CREATE, UPDATE, DELETE
  type Mutation {
    # student mutations
    createStudent(input: StudentInput!): Student

    # grade mutations
    createGrade(input: GradeInput!): Grade
  }
`);

// =====================================================
// RESOLVERS
// Fungsi yang dijalankan untuk setiap query/mutation
// Tugasnya: ambil data dari service yang sesuai
// =====================================================
const root = {

  // ---------------------------------------------------
  // STUDENT RESOLVERS
  // ---------------------------------------------------
  students: async () => {
    try {
      const res = await fetch(`${STUDENT_SERVICE_URL}/students`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      throw new Error("Gagal mengambil data mahasiswa: " + error.message);
    }
  },

  student: async ({ id }) => {
    try {
      const res = await fetch(`${STUDENT_SERVICE_URL}/students/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      throw new Error("Gagal mengambil data mahasiswa: " + error.message);
    }
  },

  studentByNim: async ({ nim }) => {
    try {
      const res = await fetch(`${STUDENT_SERVICE_URL}/students/nim/${nim}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      throw new Error("Gagal mengambil data mahasiswa: " + error.message);
    }
  },

  createStudent: async ({ input }) => {
    try {
      const res = await fetch(`${STUDENT_SERVICE_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const json = await res.json();
      return json.data;
    } catch (error) {
      throw new Error("Gagal menambahkan mahasiswa: " + error.message);
    }
  },

  // ---------------------------------------------------
  // COURSE RESOLVERS
  // ---------------------------------------------------
  courses: async () => {
    try {
      const res = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      throw new Error("Gagal mengambil data mata kuliah: " + error.message);
    }
  },

  course: async ({ id }) => {
    try {
      const res = await fetch(`${COURSE_SERVICE_URL}/api/v1/courses/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      throw new Error("Gagal mengambil data mata kuliah: " + error.message);
    }
  },

  // ---------------------------------------------------
  // ENROLLMENT RESOLVERS
  // ---------------------------------------------------
  enrollments: async () => {
    try {
      const res = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments`);
      const json = await res.json();
      return json.data || json;
    } catch (error) {
      throw new Error("Gagal mengambil data enrollment: " + error.message);
    }
  },

  enrollmentsByStudent: async ({ studentId }) => {
    try {
      const res = await fetch(`${ENROLLMENT_SERVICE_URL}/enrollments/student/${studentId}`);
      const json = await res.json();
      return json.data || json;
    } catch (error) {
      throw new Error("Gagal mengambil data enrollment: " + error.message);
    }
  },

  // ---------------------------------------------------
  // GRADE RESOLVERS
  // ---------------------------------------------------
  grades: async () => {
    try {
      const res = await fetch(`${GRADE_SERVICE_URL}/grades`);
      const json = await res.json();
      return json.data || json;
    } catch (error) {
      throw new Error("Gagal mengambil data nilai: " + error.message);
    }
  },

  gradesByStudent: async ({ studentId }) => {
    try {
      const res = await fetch(`${GRADE_SERVICE_URL}/grades/student/${studentId}`);
      const json = await res.json();
      return json.data || json;
    } catch (error) {
      throw new Error("Gagal mengambil data nilai: " + error.message);
    }
  },

  createGrade: async ({ input }) => {
    try {
      const res = await fetch(`${GRADE_SERVICE_URL}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const json = await res.json();
      return json.data || json;
    } catch (error) {
      throw new Error("Gagal menambahkan nilai: " + error.message);
    }
  },

  // ---------------------------------------------------
  // HEALTH CHECK SEMUA SERVICE
  // ---------------------------------------------------
  healthCheck: async () => {
    const services = [
      { name: "student-service", url: `${STUDENT_SERVICE_URL}/health` },
      { name: "course-service", url: `${COURSE_SERVICE_URL}/health` },
      { name: "enrollment-service", url: `${ENROLLMENT_SERVICE_URL}/health` },
      { name: "grade-service", url: `${GRADE_SERVICE_URL}/health` },
    ];

    const results = await Promise.all(
      services.map(async (s) => {
        try {
          const res = await fetch(s.url);
          const json = await res.json();
          return { service: s.name, status: json.status || "running" };
        } catch {
          return { service: s.name, status: "down" };
        }
      })
    );

    return results;
  }
};

// =====================================================
// GRAPHQL ENDPOINT
// /graphql → endpoint utama GraphQL
// graphiql: true → aktifkan playground di browser
// =====================================================
app.use("/graphql", graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true  // bisa akses playground di http://localhost:3000/graphql
}));

// health check gateway sendiri
app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "running"
  });
});

// root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "api-gateway",
    message: "API Gateway dengan GraphQL - Sistem Akademik",
    graphql_endpoint: "http://localhost:3000/graphql",
    graphiql_playground: "http://localhost:3000/graphql"
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway berjalan pada port ${PORT}`);
  console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`);
});