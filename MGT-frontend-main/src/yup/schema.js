// import * as yup from "yup";
import * as yup from "yup";

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

export const loginSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  password: yup.string().required("required"),
});

export const serviceSchema = yup.object().shape({
  jobDescription: yup.string().required("required"),
  material: yup.string(),
  size: yup.string(),
  quantity: yup.number().required("required"),
  unitPrice: yup.number().required("required"),
  totalPrice: yup.number().required("required"),

});

export const placeOrderSchema = yup.object().shape({
  customerName: yup.string(),
  contactPerson: yup.string().required("required"),
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  tinNumber: yup.number(),
  email: yup.string().email(),
  fullPayment: yup.number().required("required"),
  advancePayment: yup.number().required("required"),
  deliveryDate: yup.date().required("required"),
});
export const inventoryAddItem = yup.object().shape({
  itemCode: yup.string().required("required"),
  itemName: yup.string().required("required"),
  unit: yup.string().required("required"),
  size: yup.string(),
  thickness: yup.string(),
  serialNumber: yup.string(),
  type: yup.string(),
  color: yup.string(),
  quantity: yup.number().required("required"),
});
