import { gql } from "@apollo/client";

export const NewOrder = gql`subscription NewOrder {
    newOrder {
      email
    }
  }
  `




//   DesignedBy {
//     id
//     fullName
//     phoneNumber
//     password
//     deactivated
//     otpId
//     addedBy
//     role
//   }
//   Files {
//     id
//     fileName
//     extension
//     description
//     for
//   }
//   ReceivedBy {
//     id
//     fullName
//     phoneNumber
//     password
//     deactivated
//     addedBy
//     role
//     otpId
//   }
//   WorkShop {
//     id
//     fullName
//     phoneNumber
//     password
//     deactivated
//     otpId
//     addedBy
//     role
//   }
//   advancePayment
//   contactPerson
//   customerName
//   deliveryDate
//   designedBy
//   feedback
//   files
//   fullPayment
//   id
//   orderNumber
//   orderedDate
//   otherFeedback
//   phoneNumber
//   progress
//   receivedBy
//   remainingPayment
//   satisfactionRate
//   services {
//     service
//     jobDescription
//     material
//     size
//     progress
//     quantity
//     totalPrice
//     completedFilesId
//     completedFiles {
//       id
//       fileName
//       extension
//       description
//       for
//     }
//   }
//   tinNumber
//   workShop