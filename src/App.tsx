import React from "react";
import { Container, CssBaseline } from "@mui/material";
import AddQuestionForm from "./components/AddQuestionForm";

const App: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <h1>Question Form</h1>
      <AddQuestionForm />
    </Container>
  );
};

export default App;
