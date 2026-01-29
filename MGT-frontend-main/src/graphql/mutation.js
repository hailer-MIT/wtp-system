import { gql } from "@apollo/client";

export const ReceptionLogin = gql`
  mutation ReceptionLogin($phoneNumber: Int!, $password: String!) {
    ReceptionLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      phoneNumber
      deactivated
      addedBy
      token
      photo
    }
  }
`;
export const ReceptionSendOtp = gql`
  mutation ReceptionSendOtp($phoneNumber: Int!) {
    ReceptionSendOtp(phoneNumber: $phoneNumber)
  }
`;

export const ReceptionForgotPassword = gql`
  mutation ReceptionForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    ReceptionForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
      phoneNumber
      password
      deactivated
      otpId
      addedBy
      token
    }
  }
`;
export const SuperAdminLogin = gql`
  mutation SuperAdminLogin($phoneNumber: Int!, $password: String!) {
    SuperAdminLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      phoneNumber
      token
    }
  }
`;
export const SuperAdminForgotPassword = gql`
  mutation Mutation(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    SuperAdminForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
      phoneNumber
      password
      token
      otpId
    }
  }
`;
export const SuperAdminSendOtp = gql`
  mutation SuperAdminSendOtp($phoneNumber: Int!) {
    SuperAdminSendOtp(phoneNumber: $phoneNumber)
  }
`;
export const PlaceOrder = gql`
  mutation PlaceOrder(
    $contactPerson: String!
    $phoneNumber: Int!
    $fullPayment: Int!
    $advancePayment: Int!
    $remainingPayment: Int!
    $deliveryDate: Date!
    $customerName: String
    $tinNumber: String
    $email: String
    $services: [serviceInput!]
    $files: [ID]
    $workShop: ID
    $designedBy: ID
  ) {
    PlaceOrder(
      contactPerson: $contactPerson
      phoneNumber: $phoneNumber
      fullPayment: $fullPayment
      advancePayment: $advancePayment
      remainingPayment: $remainingPayment
      deliveryDate: $deliveryDate
      customerName: $customerName
      tinNumber: $tinNumber
      email: $email
      services: $services
      files: $files
      workShop: $workShop
      designedBy: $designedBy
    ) {
      id
      orderNumber
    }
  }
`;
export const AddUser = gql`
  mutation AddUser($fullName: String!, $phoneNumber: Int!, $role: roles!) {
    AddUser(fullName: $fullName, phoneNumber: $phoneNumber, role: $role) {
      id
      fullName
      phoneNumber
      password
      deactivated
      otpId
      addedBy
      role
    }
  }
`;
export const DesignerLogin = gql`
  mutation DesignerLogin($phoneNumber: Int!, $password: String!) {
    DesignerLogin(phoneNumber: $phoneNumber, password: $password) {
      fullName
      id
      token
      phoneNumber
      photo
    }
  }
`;
export const ManagerLogin = gql`
  mutation ManagerLogin($phoneNumber: Int!, $password: String!) {
    ManagerLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      phoneNumber
      password
      deactivated
      otpId
      addedBy
      token
    }
  }
`;
export const InventoryClerkLogin = gql`
  mutation InventoryClerkLogin($phoneNumber: Int!, $password: String!) {
    InventoryClerkLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      phoneNumber
      password
      deactivated
      otpId
      addedBy
      token
    }
  }
`;
export const DesignerForgotPassword = gql`
  mutation DesignerForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    DesignerForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
    }
  }
`;
export const InventoryClerkForgotPassword = gql`
  mutation InventoryClerkForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    InventoryClerkForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
      phoneNumber
      password
      deactivated
      otpId
      addedBy
      token
    }
  }
`;

export const ManagerForgotPassword = gql`
  mutation ManagerForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    ManagerForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
      phoneNumber
      password
      deactivated
      otpId
      addedBy
      token
    }
  }
`;

export const DesignerSendOtp = gql`
  mutation DesignerSendOtp($phoneNumber: Int!) {
    DesignerSendOtp(phoneNumber: $phoneNumber)
  }
`;
export const InventoryClerkSendOtp = gql`
  mutation InventoryClerkSendOtp($phoneNumber: Int!) {
    InventoryClerkSendOtp(phoneNumber: $phoneNumber)
  }
`;
export const ManagerSendOtp = gql`
  mutation ManagerSendOtp($phoneNumber: Int!) {
    ManagerSendOtp(phoneNumber: $phoneNumber)
  }
`;

export const WorkShopLogin = gql`
  mutation WorkShopLogin($phoneNumber: Int!, $password: String!) {
    WorkShopLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      token
      phoneNumber
      photo
    }
  }
`;
export const AccountantLogin = gql`
  mutation AccountantLogin($phoneNumber: Int!, $password: String!) {
    AccountantLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      token
    }
  }
`;
export const CashierLogin = gql`
  mutation CashierLogin($phoneNumber: Int!, $password: String!) {
    CashierLogin(phoneNumber: $phoneNumber, password: $password) {
      id
      fullName
      token
    }
  }
`;

export const WorkShopForgotPassword = gql`
  mutation WorkShopForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    WorkShopForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
    }
  }
`;
export const AccountantForgotPassword = gql`
  mutation AccountantForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    AccountantForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
    }
  }
`;
export const CashierForgotPassword = gql`
  mutation CashierForgotPassword(
    $phoneNumber: Int!
    $otp: Int!
    $password: String!
    $confirmPassword: String!
  ) {
    CashierForgotPassword(
      phoneNumber: $phoneNumber
      otp: $otp
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      fullName
    }
  }
`;

export const WorkShopSendOtp = gql`
  mutation WorkShopSendOtp($phoneNumber: Int!) {
    WorkShopSendOtp(phoneNumber: $phoneNumber)
  }
`;
export const AccountantSendOtp = gql`
  mutation AccountantSendOtp($phoneNumber: Int!) {
    AccountantSendOtp(phoneNumber: $phoneNumber)
  }
`;
export const CashierSendOtp = gql`
  mutation CashierSendOtp($phoneNumber: Int!) {
    CashierSendOtp(phoneNumber: $phoneNumber)
  }
`;

export const AddServices = gql`
  mutation AddServices(
    $name: String!
    $goseToDesigner: Boolean!
    $goseToWorkshop: Boolean!
    $descriptionGuideLine: String
  ) {
    AddServices(
      name: $name
      descriptionGuideLine: $descriptionGuideLine
      goseToDesigner: $goseToDesigner
      GoseToWorkshop: $goseToWorkshop
    ) {
      id
      name
      descriptionGuideLine
      goseToDesigner
      GoseToWorkshop
    }
  }
`;

export const DesignerChangeOrderStatus = gql`
  mutation DesignerChangeOrderStatus($orderId: ID!, $progress: progress!) {
    DesignerChangeOrderStatus(orderId: $orderId, progress: $progress)
  }
`;
export const ActivateOrDeactivateUser = gql`
  mutation ActivateOrDeactivateUser($userId: ID!, $role: roles!) {
    ActivateOrDeactivateUser(userId: $userId, role: $role)
  }
`;
export const InventoryAddNewItem = gql`
  mutation InventoryAddNewItem(
    $itemCode: String!
    $itemName: String!
    $color: String!
    $assetType: assetType!
    $quantity: Int!
    $unit: String
    $size: String
    $thickness: String
    $serialNumber: String
    $type: String
  ) {
    InventoryAddNewItem(
      itemCode: $itemCode
      itemName: $itemName
      color: $color
      assetType: $assetType
      quantity: $quantity
      unit: $unit
      size: $size
      thickness: $thickness
      serialNumber: $serialNumber
      type: $type
    ) {
      id
      itemCode
      itemName
      unit
      size
      thickness
      serialNumber
      type
      assetType
      color
      quantity
      remark
      cratedAt
    }
  }
`;
export const InventoryAddQuantity = gql`
  mutation InventoryAddQuantity($itemId: ID!, $quantity: Int!) {
    InventoryAddQuantity(itemId: $itemId, quantity: $quantity) {
      id
      itemName
      unit
      size
      thickness
      serialNumber
      type
      color
      quantity
      remark
      cratedAt
    }
  }
`;
export const InventorySubtractQuantity = gql`
  mutation InventorySubtractQuantity($itemId: ID!, $quantity: Int!) {
    InventorySubtractQuantity(itemId: $itemId, quantity: $quantity) {
      id
      itemName
      unit
      size
      thickness
      serialNumber
      type
      color
      quantity
      remark
      cratedAt
    }
  }
`;
export const WorkShopChangeOrderStatus = gql`
  mutation WorkShopChangeOrderStatus($orderId: ID!, $progress: progress!) {
    WorkShopChangeOrderStatus(orderId: $orderId, progress: $progress)
  }
`;
export const ReceptionDelivereOrder = gql`
  mutation ReceptionDelivereOrder($orderId: ID!, $progress: String!) {
    ReceptionDelivereOrder(orderId: $orderId, progress: $progress)
  }
`;
export const ChangeGoesToDesigner = gql`
  mutation ChangeGoesToDesigner($serviceId: ID!, $value: Boolean!) {
    ChangeGoesToDesigner(serviceId: $serviceId, value: $value)
  }
`;
export const ChangeGoesToWorkshop = gql`
  mutation ChangeGoesToWorkshop($serviceId: ID!, $value: Boolean!) {
    ChangeGoesToWorkshop(serviceId: $serviceId, value: $value)
  }
`;
export const DeleteService = gql`
  mutation DeleteService($serviceId: ID!) {
    DeleteService(serviceId: $serviceId)
  }
`;
export const OrderRemoveService = gql`
  mutation OrderRemoveService($orderId: ID!, $service: serviceInput!) {
    OrderRemoveService(orderId: $orderId, service: $service)
  }
`;
export const OrderAddService = gql`
  mutation OrderAddService($orderId: ID!, $service: serviceInput!) {
    OrderAddService(orderId: $orderId, service: $service)
  }
`;
export const OrderEditService = gql`
  mutation OrderEditService(
    $orderId: ID!
    $oldService: serviceInput!
    $editedService: serviceInput!
  ) {
    OrderEditService(
      orderId: $orderId
      oldService: $oldService
      editedService: $editedService
    )
  }
`;
export const OrderEdit = gql`
  mutation OrderEdit($orderId: ID!, $orderInput: orderInput!) {
    OrderEdit(orderId: $orderId, orderInput: $orderInput)
  }
`;
export const AcceptOrder = gql`
  mutation AcceptOrder($orderId: ID!) {
    AcceptOrder(orderId: $orderId)
  }
`;
export const RejectOrder = gql`
  mutation RejectOrder($orderId: ID!, $reason: String!) {
    RejectOrder(orderId: $orderId, reason: $reason)
  }
`;
export const UpdateReceptionProfile = gql`
  mutation UpdateReceptionProfile($fullName: String, $phoneNumber: Int, $photo: String) {
    UpdateReceptionProfile(fullName: $fullName, phoneNumber: $phoneNumber, photo: $photo) {
      id
      fullName
      phoneNumber
      photo
    }
  }
`;
export const UpdateDesignerProfile = gql`
  mutation UpdateDesignerProfile($fullName: String, $phoneNumber: Int, $photo: String) {
    UpdateDesignerProfile(fullName: $fullName, phoneNumber: $phoneNumber, photo: $photo) {
      id
      fullName
      phoneNumber
      photo
    }
  }
`;
export const UpdateWorkShopProfile = gql`
  mutation UpdateWorkShopProfile($fullName: String, $phoneNumber: Int, $photo: String) {
    UpdateWorkShopProfile(fullName: $fullName, phoneNumber: $phoneNumber, photo: $photo) {
      id
      fullName
      phoneNumber
      photo
    }
  }
`;

export const ReassignOrder = gql`
  mutation ReassignOrder($orderId: ID!, $designedBy: ID, $workShop: ID) {
    ReassignOrder(orderId: $orderId, designedBy: $designedBy, workShop: $workShop) {
      id
    }
  }
`;
