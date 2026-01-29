import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../../theme";
import { Formik } from "formik";
import * as yup from "yup";
import { useStoreActions } from "easy-peasy";
import { useMutation } from "@apollo/client";
import { UpdateReceptionProfile, UpdateDesignerProfile, UpdateWorkShopProfile } from "../../graphql/mutation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const profileSchema = yup.object().shape({
  fullName: yup.string().required("Name is required"),
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("Phone number is required"),
});

const Profile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("photo") || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const setSnackbar = useStoreActions(
    (actions) => actions.snackbar.setSnackbar
  );
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem("user");

  // Select the appropriate mutation based on role
  let updateProfileMutation;
  switch (userRole) {
    case "Reception":
      updateProfileMutation = UpdateReceptionProfile;
      break;
    case "Designer":
      updateProfileMutation = UpdateDesignerProfile;
      break;
    case "WorkShop":
      updateProfileMutation = UpdateWorkShopProfile;
      break;
    default:
      updateProfileMutation = UpdateReceptionProfile; // Default fallback
  }

  const [updateProfile] = useMutation(updateProfileMutation);

  // Initial values from localStorage
  const initialValues = {
    fullName: localStorage.getItem("name") || "",
    phoneNumber: localStorage.getItem("phoneNumber") || "",
    role: userRole || "",
  };

  useEffect(() => {
    // Load photo from localStorage or use default
    const savedPhoto = localStorage.getItem("photo");
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const response = await axios.post(
        "https://api.mekdesprinting.com/profilePhotoUpload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      setUploadingPhoto(false);
      return response.data.data.photo;
    } catch (error) {
      console.error("Photo upload error:", error);
      setUploadingPhoto(false);
      return null;
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      let photoUrl = null;

      // Upload photo if a new one was selected
      if (photoFile) {
        photoUrl = await uploadPhoto();
        if (photoUrl) {
          setProfilePhoto(photoUrl);
          localStorage.setItem("photo", photoUrl);
        }
      }

      // Prepare update variables
      const updateVariables = {
        fullName: values.fullName,
        phoneNumber: Number(values.phoneNumber.replace(/^0+/, "")), // Remove leading zeros
      };

      if (photoUrl) {
        updateVariables.photo = photoUrl;
      }

      // Update profile via GraphQL
      const { data } = await updateProfile({
        variables: updateVariables,
      });

      // Update localStorage with new values
      localStorage.setItem("name", data[`Update${userRole}Profile`]?.fullName || values.fullName);
      localStorage.setItem("phoneNumber", values.phoneNumber);
      if (photoUrl) {
        localStorage.setItem("photo", photoUrl);
      }

      setPhotoFile(null);
      setIsEditing(false);
      setSnackbar({
        openSnackbar: true,
        severity: "success",
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      setSnackbar({
        openSnackbar: true,
        severity: "error",
        message: error.message || "Failed to update profile",
      });
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2" fontWeight="bold" color={colors.grey[100]}>
          Profile
        </Typography>
      </Box>

      <Box
        mt={3}
        p={3}
        backgroundColor={colors.primary[400]}
        borderRadius="8px"
        maxWidth={600}
      >
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={profileSchema}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            resetForm,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Profile Photo */}
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  {uploadingPhoto ? (
                    <CircularProgress />
                  ) : (
                    <Avatar
                      src={
                        profilePhoto
                          ? profilePhoto.startsWith("http") || profilePhoto.startsWith("/")
                            ? `https://api.mekdesprinting.com${profilePhoto}`
                            : profilePhoto
                          : "../../assets/user.png"
                      }
                      sx={{ width: 150, height: 150 }}
                    />
                  )}
                  {isEditing && !uploadingPhoto && (
                    <Button
                      variant="contained"
                      component="label"
                      color="secondary"
                      size="small"
                      disabled={uploadingPhoto}
                    >
                      Change Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </Button>
                  )}
                </Box>

                {/* Name Field */}
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Full Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.fullName}
                  name="fullName"
                  error={!!touched.fullName && !!errors.fullName}
                  helperText={touched.fullName && errors.fullName}
                  disabled={true}
                />

                {/* Phone Number Field */}
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Phone Number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.phoneNumber}
                  name="phoneNumber"
                  error={!!touched.phoneNumber && !!errors.phoneNumber}
                  helperText={touched.phoneNumber && errors.phoneNumber}
                  disabled={true}
                />

                {/* Role Field (Read-only) */}
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Role"
                  value={values.role}
                  disabled
                  helperText="Role cannot be changed"
                />

                {/* Action Buttons */}
                <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                  <Button
                    color="secondary"
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default Profile;

