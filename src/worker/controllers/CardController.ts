import { Hono } from "hono";
import { DependencyTypes } from "../container";
import { DIContainer } from "../di-container";
import { createAuth } from "../lib/auth";
import { CardService } from "../service/CardService";
import { CardQueryService } from "../service/CardQueryService";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import {
  BoardId,
  CardDescription,
  CardId,
  CardStatus,
  CardTitle,
  DueDate,
  MembershipId,
} from "../domain/value-object";
import { Card } from "../domain/entities";
import { BoardService } from "../service/BoardService";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
    cardService: CardService;
    cardQueryService: CardQueryService;
    boardService: BoardService;
    user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
    session: ReturnType<typeof createAuth>["$Infer"]["Session"]["session"];
  };
}>();

export const cardRouter = app
  .post(
    "/",
    zValidator("param", z.object({ workspaceId: z.uuid(), boardId: z.uuid() })),
    zValidator(
      "json",
      z.object({
        card: z.object({
          title: z.string().min(1).max(100),
          description: z.string().min(1).max(1000),
          status: z.enum(["todo", "in_progress", "done"]),
          dueDate: z.coerce.date(),
          assigneeMembershipId: z.uuid().nullable(),
        }),
      })
    ),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const userId = c.get("user").id;

      const boardService = c.get("boardService");
      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );
      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { title, description, status, dueDate, assigneeMembershipId } =
        c.req.valid("json").card;
      const cardService = c.get("cardService");
      const createdCard = await cardService.createCard(
        BoardId.of(boardId),
        Card.of(
          CardId.of(crypto.randomUUID()),
          CardTitle.of(title),
          CardDescription.of(description),
          CardStatus.of(status),
          DueDate.of(new Date(dueDate)),
          assigneeMembershipId ? MembershipId.of(assigneeMembershipId) : null
        )
      );
      return c.json(createdCard);
    }
  )
  .get(
    "/",
    zValidator("param", z.object({ workspaceId: z.uuid(), boardId: z.uuid() })),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const userId = c.get("user").id;

      const boardService = c.get("boardService");
      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );
      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const cardQueryService = c.get("cardQueryService");
      const cardsWithAssignees = await cardQueryService.getCardsWithAssignees(
        BoardId.of(boardId)
      );

      return c.json(
        cardsWithAssignees.map(({ card, assignee }) => ({
          ...card.toJson(),
          assignee: assignee ? assignee.toJson() : null,
        }))
      );
    }
  )
  .get(
    "/:cardId",
    zValidator(
      "param",
      z.object({ workspaceId: z.uuid(), boardId: z.uuid(), cardId: z.uuid() })
    ),
    async (c) => {
      const { workspaceId, boardId, cardId } = c.req.valid("param");
      const userId = c.get("user").id;

      const boardService = c.get("boardService");
      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );
      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const cardService = c.get("cardService");
      const card = await cardService.findCardById(
        BoardId.of(boardId),
        CardId.of(cardId)
      );
      return c.json(card);
    }
  )
  .put(
    "/:cardId",
    zValidator(
      "param",
      z.object({ workspaceId: z.uuid(), boardId: z.uuid(), cardId: z.uuid() })
    ),
    zValidator(
      "json",
      z.object({
        card: z.object({
          title: z.string().min(1).max(100),
          description: z.string().min(1).max(1000),
          status: z.enum(["todo", "in_progress", "done"]),
          dueDate: z.coerce.date(),
          assigneeMembershipId: z.uuid().nullable(),
        }),
      })
    ),
    async (c) => {
      const { workspaceId, boardId, cardId } = c.req.valid("param");
      const userId = c.get("user").id;

      const boardService = c.get("boardService");
      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );
      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { title, description, status, dueDate, assigneeMembershipId } =
        c.req.valid("json").card;
      const cardService = c.get("cardService");
      const card = await cardService.updateCard(
        BoardId.of(boardId),
        Card.of(
          CardId.of(cardId),
          CardTitle.of(title),
          CardDescription.of(description),
          CardStatus.of(status),
          DueDate.of(new Date(dueDate)),
          assigneeMembershipId ? MembershipId.of(assigneeMembershipId) : null
        )
      );
      return c.json(card);
    }
  )
  .delete(
    "/:cardId",
    zValidator(
      "param",
      z.object({ workspaceId: z.uuid(), boardId: z.uuid(), cardId: z.uuid() })
    ),
    async (c) => {
      const { workspaceId, boardId, cardId } = c.req.valid("param");
      const userId = c.get("user").id;

      const boardService = c.get("boardService");
      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );
      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const cardService = c.get("cardService");
      await cardService.deleteCard(BoardId.of(boardId), CardId.of(cardId));
      return c.json({ message: "Card deleted" });
    }
  );
