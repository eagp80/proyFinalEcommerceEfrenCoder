import { ticketModel } from "../models/ticket.model.js";

class TicketManager {

  async createTicket(purchaser, amount, products) {
    try {
      console.log("🚀 ~ file: tickets.manager.js:11 ~ TicketManager ~ createTicket ~ products:", products)

      const newTicket = await ticketModel.create({
        purchaser,
        amount,
        products
      })
  
      return {
        message: 'Ticket created',
        ticket: newTicket,
      }
    } catch (error) {
      throw new Error('Error while emiting ticket')
    }
  }

  async getLastTicketUser(purchaser){
    console.log("🚀 ~ file: tickets.manager.js:25 ~ TicketManager ~ getLastTicketUser ~ purchaser:", purchaser)
    try {

      const ticket = await ticketModel.findOne({purchaser}).limit(1).sort({updatedAt: -1}).populate("products.product").exec();

      return ticket;
      
    } catch (error) {
      throw new Error('Error while getLastTicketUser')
    }
  }

}

export default new TicketManager();