import "./App.css";
import { Home, PostDetails, PostsList } from "./component/list";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"  element={<Home/>} />
        <Route path="/:id" element={<PostDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
