const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");


const TEST_TIMEOUT = 30000;
jest.setTimeout(TEST_TIMEOUT);

describe("College Appointment System E2E Test", () => {
  let studentA1Token, studentA2Token, professorP1Token;
  let studentA1Id, studentA2Id, professorP1Id;
  let availabilityT1Id, availabilityT2Id;
  let appointmentA1Id, appointmentA2Id;

  beforeAll(async () => {
    // Connect to test database
  const testURI = process.env.MONGODB_URI.replace(
    /\/\w+$/,
    "/college_appointment_test"
  );

  await mongoose.connect(testURI);

  
  
  
  });

  beforeEach(async () => {
   
    await User.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
  });

  afterAll(async () => {

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("Complete E2E User Flow", async () => {
    console.log(" Starting E2E Test: College Appointment System");

    const studentA1RegisterResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Student A1",
        email: "studenta1@college.edu",
        password: "password123",
        role: "student",
      });

    expect(studentA1RegisterResponse.status).toBe(201);
    expect(studentA1RegisterResponse.body).toHaveProperty("token");
    expect(studentA1RegisterResponse.body.user.role).toBe("student");

    studentA1Token = studentA1RegisterResponse.body.token;
    studentA1Id = studentA1RegisterResponse.body.user._id;
    


    const professorP1RegisterResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Professor P1",
        email: "professorp1@college.edu",
        password: "password123",
        role: "professor",
        department: "Computer Science",
      });

    expect(professorP1RegisterResponse.status).toBe(201);
    expect(professorP1RegisterResponse.body).toHaveProperty("token");
    expect(professorP1RegisterResponse.body.user.role).toBe("professor");

    professorP1Token = professorP1RegisterResponse.body.token;
    professorP1Id = professorP1RegisterResponse.body.user._id;

 

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(11, 0, 0, 0);

    const availabilityT1Response = await request(app)
      .post("/api/professor/availability")
      .set("Authorization", `Bearer ${professorP1Token}`)
      .send({
        startTime: tomorrow.toISOString(),
        endTime: tomorrowEnd.toISOString(),
      });

    expect(availabilityT1Response.status).toBe(201);
    expect(availabilityT1Response.body.availability).toHaveProperty("_id");
    availabilityT1Id = availabilityT1Response.body.availability._id;

    const tomorrowT2 = new Date();
    tomorrowT2.setDate(tomorrowT2.getDate() + 1);
    tomorrowT2.setHours(14, 0, 0, 0);
    const tomorrowT2End = new Date(tomorrowT2);
    tomorrowT2End.setHours(15, 0, 0, 0);

    const availabilityT2Response = await request(app)
      .post("/api/professor/availability")
      .set("Authorization", `Bearer ${professorP1Token}`)
      .send({
        startTime: tomorrowT2.toISOString(),
        endTime: tomorrowT2End.toISOString(),
      });

    expect(availabilityT2Response.status).toBe(201);
    expect(availabilityT2Response.body.availability).toHaveProperty("_id");
    availabilityT2Id = availabilityT2Response.body.availability._id;

    const viewAvailabilityResponse = await request(app)
      .get(`/api/student/professors/${professorP1Id}/availability`)
      .set("Authorization", `Bearer ${studentA1Token}`);

    expect(viewAvailabilityResponse.status).toBe(200);
    expect(viewAvailabilityResponse.body.availability).toHaveLength(2);
    expect(
      viewAvailabilityResponse.body.availability.some(
        (slot) => slot._id === availabilityT1Id
      )
    ).toBe(true);
    expect(
      viewAvailabilityResponse.body.availability.some(
        (slot) => slot._id === availabilityT2Id
      )
    ).toBe(true);

    const bookT1Response = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${studentA1Token}`)
      .send({
        availabilityId: availabilityT1Id,
        notes: "Discussion about final project",
      });

    expect(bookT1Response.status).toBe(201);
    expect(bookT1Response.body.appointment).toHaveProperty("_id");
    expect(bookT1Response.body.appointment.status).toBe("scheduled");
    appointmentA1Id = bookT1Response.body.appointment._id;

    const studentA2RegisterResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Student A2",
        email: "studenta2@college.edu",
        password: "password123",
        role: "student",
      });

    expect(studentA2RegisterResponse.status).toBe(201);
    expect(studentA2RegisterResponse.body).toHaveProperty("token");
    expect(studentA2RegisterResponse.body.user.role).toBe("student");

    studentA2Token = studentA2RegisterResponse.body.token;
    studentA2Id = studentA2RegisterResponse.body.user._id;

    const bookT2Response = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${studentA2Token}`)
      .send({
        availabilityId: availabilityT2Id,
        notes: "Help with assignment submission",
      });

    expect(bookT2Response.status).toBe(201);
    expect(bookT2Response.body.appointment).toHaveProperty("_id");
    expect(bookT2Response.body.appointment.status).toBe("scheduled");
    appointmentA2Id = bookT2Response.body.appointment._id;

    const checkAvailabilityResponse = await request(app)
      .get(`/api/student/professors/${professorP1Id}/availability`)
      .set("Authorization", `Bearer ${studentA2Token}`);

    expect(checkAvailabilityResponse.status).toBe(200);
    expect(checkAvailabilityResponse.body.availability).toHaveLength(0); 

    const cancelAppointmentResponse = await request(app)
      .put(`/api/appointments/${appointmentA1Id}/cancel`)
      .set("Authorization", `Bearer ${professorP1Token}`);

    expect(cancelAppointmentResponse.status).toBe(200);
    expect(cancelAppointmentResponse.body.appointment.status).toBe("cancelled");
    expect(cancelAppointmentResponse.body.appointment.cancelledBy._id).toBe(
      professorP1Id
    );

    const checkAvailabilityAfterCancelResponse = await request(app)
      .get(`/api/student/professors/${professorP1Id}/availability`)
      .set("Authorization", `Bearer ${studentA1Token}`);

    expect(checkAvailabilityAfterCancelResponse.status).toBe(200);
    expect(checkAvailabilityAfterCancelResponse.body.availability).toHaveLength(
      1
    );
    expect(checkAvailabilityAfterCancelResponse.body.availability[0]._id).toBe(
      availabilityT1Id
    );


    const studentA1AppointmentsResponse = await request(app)
      .get("/api/student/appointments?status=scheduled")
      .set("Authorization", `Bearer ${studentA1Token}`);

    expect(studentA1AppointmentsResponse.status).toBe(200);
    expect(studentA1AppointmentsResponse.body.appointments).toHaveLength(0); 

    const studentA1AllAppointmentsResponse = await request(app)
      .get("/api/student/appointments")
      .set("Authorization", `Bearer ${studentA1Token}`);

    expect(studentA1AllAppointmentsResponse.status).toBe(200);
    expect(studentA1AllAppointmentsResponse.body.appointments).toHaveLength(1); 
    expect(studentA1AllAppointmentsResponse.body.appointments[0].status).toBe(
      "cancelled"
    );


    const studentA2AppointmentsResponse = await request(app)
      .get("/api/student/appointments?status=scheduled")
      .set("Authorization", `Bearer ${studentA2Token}`);

    expect(studentA2AppointmentsResponse.status).toBe(200);
    expect(studentA2AppointmentsResponse.body.appointments).toHaveLength(1); 
    expect(studentA2AppointmentsResponse.body.appointments[0]._id).toBe(
      appointmentA2Id
    );

    console.log(
      " E2E Test completed successfully! All user flow steps passed."
    );
  });

 
  test("Authentication and Authorization Tests", async () => {

    //  invalid login
    const invalidLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@college.edu",
        password: "wrongpassword",
      });

    expect(invalidLoginResponse.status).toBe(401);
    expect(invalidLoginResponse.body.message).toBe("Invalid credentials");

    //  protected route without token
    const noTokenResponse = await request(app).get("/api/student/professors");

    expect(noTokenResponse.status).toBe(401);
    expect(noTokenResponse.body.message).toBe(
      "Access denied. No token provided."
    );

  });

  test("Booking Constraints Tests", async () => {
    

    const student = await request(app).post("/api/auth/register").send({
      name: "Test Student",
      email: "teststudent@college.edu",
      password: "password123",
      role: "student",
    });

    const professor = await request(app).post("/api/auth/register").send({
      name: "Test Professor",
      email: "testprofessor@college.edu",
      password: "password123",
      role: "professor",
      department: "Mathematics",
    });

    const studentToken = student.body.token;
    const professorToken = professor.body.token;

    const futureTime = new Date();
    futureTime.setDate(futureTime.getDate() + 1);
    futureTime.setHours(16, 0, 0, 0);
    const futureTimeEnd = new Date(futureTime);
    futureTimeEnd.setHours(17, 0, 0, 0);

    const availability = await request(app)
      .post("/api/professor/availability")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        startTime: futureTime.toISOString(),
        endTime: futureTimeEnd.toISOString(),
      });

    const availabilityId = availability.body.availability._id;

    const firstBooking = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        availabilityId: availabilityId,
        notes: "First booking",
      });

    expect(firstBooking.status).toBe(201);

    
    const secondBooking = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        availabilityId: availabilityId,
        notes: "Second booking attempt",
      });

    expect(secondBooking.status).toBe(400);
    expect(secondBooking.body.message).toBe("This time slot is already booked");

  });
});
