import { gql } from "@apollo/client";

export const AllOrders = gql`query AllOrders($page: Int!, $limit: Int!, $field: String, $value: String, $options: [String]) {
  AllOrders(page: $page, limit: $limit, field: $field, value: $value, options: $options) {
    data {
      id
      orderNumber
      customerName
      contactPerson
      phoneNumber
      tinNumber
      email
      fullPayment
      advancePayment
      remainingPayment
      services {
        service
        jobDescription
        material
        size
        progress
        quantity
        totalPrice
      }
      receivedBy
      ReceivedBy {
        fullName
      }
      files
      Files {
        id
        fileName
        extension
        description
        for
      }
      designedBy
      DesignedBy {
        fullName
      }
      workShop
      WorkShop {
        fullName
      }
      orderedDate
      deliveryDate
      progress
      satisfactionRate
      feedback
      otherFeedback
      edited
      editedFile {
        customerName
        contactPerson
        phoneNumber
        tinNumber
        email
        fullPayment
        advancePayment
        remainingPayment
        designedBy
        workShop
      }
      assignmentStatus
      rejectionReason
      rejectedDate
      reassignedDate
      pendingDate
      designingStartDate
      designerCompletedDate
      waitingForPrintDate
      printingDate
      completedDate
      deliveredDate
    }
    total
  }
}`
export const AllServices = gql`query AllServices {
  AllServices {
    id
    name
    descriptionGuideLine
    goseToDesigner
    GoseToWorkshop
  }
}
`
export const OrdersStats = gql`query OrdersStats {
  OrdersStats {
    lastMonthOrders
    thisMonthOrders
    pendingOrders
    completedOrders
    lateOrders
    rejectedOrders
  }
}
`

export const GetAllUsers = gql`query GetAllUsers {
  GetAllUsers {
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
`
export const DesignerMyStat = gql`query DesignerMyStat {
  DesignerMyStat {
    lastMonthOrders
    thisMonthOrders
    pendingOrders
    completedOrders
    lateOrders
  }
}
`
export const DesignersStat = gql`query DesignersStat {
  DesignersStat {
    name
    lastMonthOrders
    thisMonthOrders
    pendingOrders
    completedOrders
    lateOrders
  }
}`
export const WorkShopMyStat = gql`query WorkShopMyStat {
  WorkShopMyStat {
    lastMonthOrders
    thisMonthOrders
    pendingOrders
    completedOrders
    lateOrders
  }
}`
export const InventoryGetAssets = gql`query InventoryGetAssets($assetType: assetType!) {
  InventoryGetAssets(assetType: $assetType) {
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
}`
export const DesignerMyOrder = gql`query ExampleQuery($options: [progress]!) {
  DesignerMyOrder(options: $options) {
    id
    customerName
    contactPerson
    phoneNumber
    tinNumber
    email
    fullPayment
    advancePayment
    remainingPayment
    services {
      service
      jobDescription
      material
      size
      quantity
      completedFiles {
        id
        fileName
        extension
        description
      }
    }
    receivedBy
    files
    Files {
      id
      fileName
      extension
      description
      for
    }
    designedBy
    workShop
    orderedDate
    deliveryDate
    progress
    satisfactionRate
    feedback
    otherFeedback
    assignmentStatus
    rejectionReason
    rejectedDate
    reassignedDate
    pendingDate
    designingStartDate
    designerCompletedDate
    waitingForPrintDate
    printingDate
    completedDate
    deliveredDate
  }
}
`
export const WorkShopMyOrder = gql`query WorkShopMyOrder($options: [progress]!) {
  WorkShopMyOrder(options: $options) {
    id
    customerName
    contactPerson
    phoneNumber
    tinNumber
    email
    fullPayment
    advancePayment
    remainingPayment
    services {
      service
      jobDescription
      material
      size
      quantity
      completedFiles {
        id
        fileName
        extension
        description
      }
    }
    receivedBy
    files
    Files {
      id
      fileName
      extension
      description
      for
    }
    designedBy
    workShop
    orderedDate
    deliveryDate
    progress
    satisfactionRate
    feedback
    otherFeedback
    assignmentStatus
    rejectionReason
    rejectedDate
    reassignedDate
    pendingDate
    designingStartDate
    designerCompletedDate
    waitingForPrintDate
    printingDate
    completedDate
    deliveredDate
  }
}`

export const InventoryHistory = gql`query InventoryHistory($itemId: ID!) {
  InventoryHistory(itemId: $itemId) {
    id
    inventoryProductId
    operation
    quantity
    inventoryClerkId
    cratedAt
  }
}`
export const WorkShopStat = gql`query WorkShopStat {
  WorkShopStat {
    name
    lastMonthOrders
    thisMonthOrders
    pendingOrders
    completedOrders
    lateOrders
  }
}`
export const AllDesigners = gql`query AllDesigners {
  AllDesigners {
    id
    fullName
    phoneNumber
    password
    deactivated
    otpId
    addedBy
  }
}`
export const AllWorkshops = gql`query AllWorkshops {
  AllWorkshops {
    id
    fullName
    phoneNumber
    password
    deactivated
    otpId
    addedBy
  }
}`