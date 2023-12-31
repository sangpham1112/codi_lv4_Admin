import { useContext, useLayoutEffect, useState } from "react";
import { GlobalContext } from "../../context/GlobalProvider";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSchedulesByTeacher, teacherPass } from "../../api/Schedules";
import { useCustomMutate } from "~/hooks/useCustomMutate";
import Table from "~/components/Table";
import Loading from "~/components/Loading";
import Button from "~/components/Button";
import StudentsModal from "./components/StudentsModal";

const TeacherPass = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [selectedID, setSelectedID] = useState(0);
  const [isFinish, setIsFinish] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["schedules", id],
    queryFn: () => getSchedulesByTeacher(id),
  });
  const schedulesTeacher = data?.schedules;

  const { mutation: teacherPassMutation } = useCustomMutate(
    "schedules",
    teacherPass
  );

  const handlePass = (scheduleId) => {
    teacherPassMutation.mutate(scheduleId);
  };

  const handleOpenModal = (index, isFinished) => {
    setSelectedID(index);
    setIsFinish(isFinished);
  };

  useLayoutEffect(() => {
    if (currentUser && currentUser.role_id !== 1 && currentUser.id !== id) {
      navigate("/teacher/check/" + currentUser.id);
    }
  }, [currentUser]);

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <span>{error.message}</span>;
  }

  return (
    <>
      <Table
        title="Khoá đang dạy"
        tableHeader={[
          "Tên khoá học",
          "Mã Lớp",
          "Lịch học",
          "Tiến độ",
          "Danh Sách",
        ]}>
        {schedulesTeacher.map((item, index) => {
          return (
            <tr>
              <td>#{++index}</td>
              <td>{item.course_name}</td>
              <td>{item.name}</td>
              <td>{item.schedule_time}</td>
              <td>
                {item.pass + "/" + item.duration}
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: (item.pass / item.duration) * 100 }}
                    aria-valuenow={(item.pass / item.duration) * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}>
                    {(item.pass / item.duration) * 100}%
                  </div>
                </div>
              </td>
              <td>
                <Button
                  name="Xem"
                  data-bs-toggle="modal"
                  data-bs-target="#HVModal"
                  onClick={() =>
                    handleOpenModal(index - 1, item.duration == item.pass)
                  }
                />
              </td>
              <td>
                {item.pass === item.duration ? (
                  <span className="badge bg-success">Hoàn thành</span>
                ) : (
                  <Button name="Xác nhận" onClick={() => handlePass(item.id)} />
                )}
              </td>
            </tr>
          );
        })}
      </Table>
      <StudentsModal
        isFinish={isFinish}
        studentsInClass={schedulesTeacher[selectedID]?.studentsInClass}
      />
    </>
  );
};

export default TeacherPass;
