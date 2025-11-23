import { Card } from "../domain/entities";
import { BoardId, CardId } from "../domain/value-object";
import { ICardRepository } from "../infrastructure/CardRepository";

export interface ICardService {
  findCardById(boardId: BoardId, cardId: CardId): Promise<Card>;
  findCardsByBoardId(boardId: BoardId): Promise<Card[]>;
  createCard(boardId: BoardId, card: Card): Promise<Card>;
  updateCard(boardId: BoardId, card: Card): Promise<Card>;
  deleteCard(boardId: BoardId, cardId: CardId): Promise<void>;
}

export class CardService implements ICardService {
  constructor(private readonly cardRepository: ICardRepository) {}
  async findCardById(boardId: BoardId, cardId: CardId): Promise<Card> {
    const card = await this.cardRepository.findByCardId(boardId, cardId);
    if (!card) {
      throw new Error("Card not found");
    }
    return card;
  }

  async findCardsByBoardId(boardId: BoardId): Promise<Card[]> {
    return this.cardRepository.findByBoardId(boardId);
  }

  async createCard(boardId: BoardId, card: Card): Promise<Card> {
    return this.cardRepository.create(boardId, card);
  }

  async updateCard(boardId: BoardId, card: Card): Promise<Card> {
    return this.cardRepository.update(boardId, card);
  }

  async deleteCard(boardId: BoardId, cardId: CardId): Promise<void> {
    return this.cardRepository.delete(boardId, cardId);
  }
}
