import { useEffect, useState } from "react";
import { useFormik } from "formik";

export default function UserProfile() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      details: "",
    },
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("details", values.details);

      const res = await fetch("https://react-production-db03.up.railway.app/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setUsers([...users, data]);
      setShowForm(false);
      resetForm();
      setFile(null);
    },
  });

  return (
    <>
    <div className="container">
      <h2 className="title">Users</h2>
      {/* Users List */}
      <div className="userGrid">
        {users.map((u, i) => (
          <div key={i} className="card">
            <img src={u.image} alt="" className="cardImg" />
            <h4>{u.name}</h4>
            <p>{u.email}</p>
            <small>{u.details}</small>
          </div>
        ))}
      </div>

      <button className="floatingBtn" onClick={() => setShowForm(true)}>+</button>

      {showForm && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h3>Add User</h3>
            <form onSubmit={formik.handleSubmit} className="form">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={formik.handleChange}
                value={formik.values.name}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              <textarea
                name="details"
                placeholder="Details"
                onChange={formik.handleChange}
                value={formik.values.details}
              />
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
