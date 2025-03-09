export class StudentTrackingModel {
  constructor(data) {
    this.id = data.id;
    this.student = data.student;
    this.professor = data.professor;
    this.period = data.period;
    this.trackingType = data.trackingType;
    this.situation = data.situation;
    this.compromise = data.compromise;
    this.followUp = data.followUp;
    this.status = data.status;
    this.date = data.date;
  }
  
  isWithinDateRange(startDate, endDate) {
    const periodStart = new Date(this.period.startDate);
    const periodEnd = new Date(this.period.endDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (!start || periodEnd >= start) && (!end || periodStart <= end);
  }

  matchesStudentQuery(query) {
    const fullName = `${this.student.firstName} ${this.student.lastName}`.toLowerCase();
    return fullName.includes(query.toLowerCase());
  }

  toJSON() {
    return {
      id: this.id,
      student: {
        id: this.student.id,
        username: this.student.username,
        email: this.student.email,
        lastName: this.student.lastName,
        firstName: this.student.firstName,
        uuid: this.student.uuid,
      },
      professor: {
        id: this.professor.id,
        username: this.professor.username,
        email: this.professor.email,
        lastName: this.professor.lastName,
        firstName: this.professor.firstName,
        uuid: this.professor.uuid,
      },
      period: {
        id: this.period.id,
        startDate: this.period.startDate,
        endDate: this.period.endDate,
        name: this.period.name,
        status: this.period.status,
      },
      trackingType: {
        id: this.trackingType.id,
        type: this.trackingType.type,
      },
      situation: this.situation,
      compromise: this.compromise,
      followUp: this.followUp,
      status: this.status,
      date: this.date
    };
  }
}
