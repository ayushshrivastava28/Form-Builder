import React, { useState, useEffect } from "react";
import {
    Button,
    TextField,
    FormControlLabel,
    Switch,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { v4 as uuidv4 } from 'uuid';

interface AdditionalFields {
    numberType?: "integer" | "decimal";
    min?: number;
    max?: number;
}

interface Question {
    id: string;
    title: string;
    type: string;
    required: boolean;
    helperText?: string;
    additionalFields?: AdditionalFields;
}

const saveToLocalStorage = (questions: Question[]) => {
    return new Promise<void>((resolve, reject) => {
        try {
            localStorage.setItem("questions", JSON.stringify(questions));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

const loadFromLocalStorage = (): Question[] => {
    const savedQuestions = localStorage.getItem("questions");
    return savedQuestions ? JSON.parse(savedQuestions) : [];
};

const AddQuestionForm: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>(loadFromLocalStorage());
    const [questionTitle, setQuestionTitle] = useState<string>("");
    const [questionType, setQuestionType] = useState<string>("");
    const [isRequired, setIsRequired] = useState<boolean>(false);
    const [helperText, setHelperText] = useState<string>("");
    const [additionalFields, setAdditionalFields] = useState<AdditionalFields>({});
    const [showForm, setShowForm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleAddQuestionClick = () => {
        if (questions.length !== 0 || !error) {
            setQuestionTitle("");
            setQuestionType("");
            setIsRequired(false);
            setHelperText("");
            setAdditionalFields({});
            setShowForm(true);
            setExpanded(false); // Ensure no accordion is expanded when adding a new question
        }
    };

    const handleAdditionalFields = (field: string, value: any) => {
        setAdditionalFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeleteQuestion = (id: string) => {
        const updatedQuestions = questions.filter((q) => q.id !== id);
        setQuestions(updatedQuestions);
        saveToLocalStorage(updatedQuestions);
    };

    const handleSaveChanges = () => {
        if (questionTitle.trim() === "" || questionType.trim() === "") {
            setError("Please fill in all required fields.");
            return;
        }

        if (expanded === false) {
            // Creating a new question
            const newQuestion: Question = {
                id: uuidv4(),
                title: questionTitle,
                type: questionType,
                required: isRequired,
                helperText,
                additionalFields,
            };
            setQuestions([...questions, newQuestion]);
            setSuccessMessage("Question added successfully.");
        } else {
            // Updating an existing question
            const updatedQuestions = questions.map((q) =>
                q.id === expanded
                    ? {
                        ...q,
                        title: questionTitle,
                        type: questionType,
                        required: isRequired,
                        helperText,
                        additionalFields,
                    }
                    : q
            );
            setQuestions(updatedQuestions);
            setSuccessMessage("Question updated successfully.");
        }
        saveToLocalStorage(questions);
        setShowForm(false);
        setExpanded(false); // Close accordion after saving
    };

    const handleAccordionChange = (id: string = "") => (event: React.SyntheticEvent, isExpanded: boolean) => {
        if (isExpanded) {
            setExpanded(id); // Expand accordion
            const questionToEdit = questions.find((q) => q.id === id);
            if (questionToEdit) {
                setQuestionTitle(questionToEdit.title);
                setQuestionType(questionToEdit.type);
                setIsRequired(questionToEdit.required);
                setHelperText(questionToEdit.helperText || "");
                setAdditionalFields(questionToEdit.additionalFields || {});
                setShowForm(false);
            }
        } else {
            handleSaveChanges(); // Save changes when the accordion is collapsed
        }
    };

    useEffect(() => {
        if (questions.length === 0) {
            setQuestionTitle("");
            setQuestionType("");
            setIsRequired(false);
            setHelperText("");
            setAdditionalFields({});
            setExpanded(false);
        };
    }, [questions]);

    return (
        <Box>
            {loading && <CircularProgress />}
            <Box mt={4}>
                {questions.length > 0 && (
                    <>
                        {questions.map((question) => (
                            <Accordion
                                key={question.id}
                                expanded={expanded === question.id}
                                onChange={handleAccordionChange(question.id)}
                                sx={{ marginBottom: 2 }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="h6" width="100%">{question.title}</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                                        {expanded === question.id && (
                                            <CheckCircleIcon
                                                sx={{ color: 'green', ml: 1 }}
                                                titleAccess="Form saved"
                                            />
                                        )}
                                        <IconButton
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            edge="end"
                                            sx={{ ml: 1 }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <TextField
                                            label="Question Title"
                                            value={questionTitle}
                                            onChange={(e) => setQuestionTitle(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Question Type</InputLabel>
                                            <Select
                                                value={questionType}
                                                onChange={(e) => setQuestionType(e.target.value)}
                                                label="Question Type"
                                            >
                                                <MenuItem value="text">Text</MenuItem>
                                                <MenuItem value="date">Date</MenuItem>
                                                <MenuItem value="select">Select</MenuItem>
                                                <MenuItem value="number">Number</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {questionType === "number" && (
                                            <Box display="flex" gap={2} mb={2}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Number Type</InputLabel>
                                                    <Select
                                                        value={additionalFields.numberType || ""}
                                                        onChange={(e) =>
                                                            handleAdditionalFields(
                                                                "numberType",
                                                                e.target.value
                                                            )
                                                        }
                                                        label="Number Type"
                                                    >
                                                        <MenuItem value="integer">Integer</MenuItem>
                                                        <MenuItem value="decimal">Decimal</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <TextField
                                                    label="Min Value"
                                                    value={additionalFields.min || ""}
                                                    onChange={(e) =>
                                                        handleAdditionalFields(
                                                            "min",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    type="number"
                                                    fullWidth
                                                />
                                                <TextField
                                                    label="Max Value"
                                                    value={additionalFields.max || ""}
                                                    onChange={(e) =>
                                                        handleAdditionalFields(
                                                            "max",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    type="number"
                                                    fullWidth
                                                />
                                            </Box>
                                        )}
                                        <TextField
                                            label="Helper Text"
                                            value={helperText}
                                            onChange={(e) => setHelperText(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={isRequired}
                                                    onChange={(e) => setIsRequired(e.target.checked)}
                                                />
                                            }
                                            label="Required"
                                        />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </>
                )}
                {(showForm || !questions.length) && (
                    <Accordion
                        expanded={true}
                        onChange={handleSaveChanges}
                        sx={{ marginBottom: 2 }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <TextField
                                    label="Question Title"
                                    value={questionTitle}
                                    onChange={(e) => setQuestionTitle(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Question Type</InputLabel>
                                    <Select
                                        value={questionType}
                                        onChange={(e) => setQuestionType(e.target.value)}
                                        label="Question Type"
                                    >
                                        <MenuItem value="text">Text</MenuItem>
                                        <MenuItem value="date">Date</MenuItem>
                                        <MenuItem value="select">Select</MenuItem>
                                        <MenuItem value="number">Number</MenuItem>
                                    </Select>
                                </FormControl>
                                {questionType === "number" && (
                                    <Box display="flex" gap={2} mb={2}>
                                        <FormControl fullWidth>
                                            <InputLabel>Number Type</InputLabel>
                                            <Select
                                                value={additionalFields.numberType || ""}
                                                onChange={(e) =>
                                                    handleAdditionalFields("numberType", e.target.value)
                                                }
                                                label="Number Type"
                                            >
                                                <MenuItem value="integer">Integer</MenuItem>
                                                <MenuItem value="decimal">Decimal</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="Min Value"
                                            value={additionalFields.min || ""}
                                            onChange={(e) =>
                                                handleAdditionalFields("min", Number(e.target.value))
                                            }
                                            type="number"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Max Value"
                                            value={additionalFields.max || ""}
                                            onChange={(e) =>
                                                handleAdditionalFields("max", Number(e.target.value))
                                            }
                                            type="number"
                                            fullWidth
                                        />
                                    </Box>
                                )}
                                <TextField
                                    label="Helper Text"
                                    value={helperText}
                                    onChange={(e) => setHelperText(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isRequired}
                                            onChange={(e) => setIsRequired(e.target.checked)}
                                        />
                                    }
                                    label="Required"
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )}
            </Box>
            {!expanded && (
                <Button variant="contained" onClick={handleAddQuestionClick} sx={{ marginTop: 2 }}>
                    Add Question
                </Button>
            )}
            {error && (
                <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
                    <Alert onClose={() => setError(null)} severity="error">
                        {error}
                    </Alert>
                </Snackbar>
            )}
            {successMessage && (
                <Snackbar open={Boolean(successMessage)} autoHideDuration={6000} onClose={() => setSuccessMessage(null)}>
                    <Alert onClose={() => setSuccessMessage(null)} severity="success">
                        {successMessage}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default AddQuestionForm;
