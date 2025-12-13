type Course = {
  id: string;
  title: string;
  // Add other fields based on your course schema (e.g., userId, createdAt)
};

interface CoursesListProps {
  items: Course[];
}

const CoursesList = ({ items }: CoursesListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Courses</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((course) => (
            <li key={course.id} className="p-4 border rounded-md">
              <h3 className="text-lg font-medium">{course.title}</h3>
              {/* Add other course fields as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CoursesList;
