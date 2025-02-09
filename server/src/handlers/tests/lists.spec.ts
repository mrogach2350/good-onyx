import { Request, Response } from "express";
import {
  getAllListsHandler,
  createListHandler,
  updateListHandler,
  deleteListHandler,
  getListVehiclesHandler,
  addVehiclesToListHandler,
  removeVehiclesFromListHandler,
} from "../lists";
import * as dbInteractions from "../../db/interactions/lists";

// Mock the database interactions
jest.mock("../../db/interactions/lists");
const mockedDbInteractions = jest.mocked(dbInteractions);

// Mock the logger
jest.mock("../../index", () => ({
  logger: {
    debug: jest.fn(),
  },
}));

describe("List Handlers", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    mockResponse = {
      json: jsonMock,
    };
    mockRequest = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllListsHandler", () => {
    it("should return all lists when successful", async () => {
      const mockLists = [{ id: 1, title: "Test List", description: null }];
      mockedDbInteractions.getAllLists.mockResolvedValueOnce(mockLists);

      await getAllListsHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        lists: mockLists,
      });
    });

    it("should return error when database call fails", async () => {
      const error = new Error("Database error");
      mockedDbInteractions.getAllLists.mockRejectedValueOnce(error);

      await getAllListsHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error,
      });
    });
  });

  describe("createListHandler", () => {
    it("should create a list when given valid title", async () => {
      const mockList = [{ id: 1, title: "New List", description: null }];
      mockRequest.body = { title: "New List" };
      mockedDbInteractions.createList.mockResolvedValueOnce(mockList);

      await createListHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        listId: 1,
      });
    });

    it("should handle empty title", async () => {
      const mockList = [{ id: 1, title: "", description: null }];
      mockRequest.body = {};
      mockedDbInteractions.createList.mockResolvedValueOnce(mockList);

      await createListHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        listId: 1,
      });
    });
  });

  describe("updateListHandler", () => {
    it("should update a list when given valid id and title", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { title: "Updated List" };
      mockedDbInteractions.updateList.mockResolvedValueOnce([{ id: 1 }]);

      await updateListHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        listId: 1,
      });
    });
  });

  describe("deleteListHandler", () => {
    it("should delete a list when given valid id", async () => {
      mockRequest.params = { id: "1" };
      mockedDbInteractions.deleteList.mockResolvedValueOnce([{ id: 1 }]);

      await deleteListHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        listId: 1,
      });
    });
  });

  describe("getListVehiclesHandler", () => {
    it("should return vehicles for a valid list id", async () => {
      const mockVehicles = [
        {
          url: "https://example.com",
          id: 1,
          title: "Toyota Camry",
          listNumber: "12345",
          engine: "V6",
          transmission: "Automatic",
          make: "Toyota",
          model: "Camry",
          mileage: 50000,
          year: 2020,
          vin: "ABC123",
          price: 25000,
          status: "available",
          deleted: false,
          offers: [],
          auctionId: null,
          note: null,
          currentBidAmount: null,
          secondsLeftToBid: null,
          deletedAt: null,
        },
      ];
      mockRequest.params = { id: "1" };
      mockedDbInteractions.getVehiclesByListId.mockResolvedValueOnce(
        mockVehicles
      );

      await getListVehiclesHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        vehicles: mockVehicles,
      });
    });
  });

  describe("addVehiclesToListHandler", () => {
    it("should add vehicles to a list", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { vehicleIds: [1, 2, 3] };
      mockedDbInteractions.addVehiclesToList.mockResolvedValueOnce();

      await addVehiclesToListHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
      });
    });
  });

  describe("removeVehiclesFromListHandler", () => {
    it("should remove vehicles from a list", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { vehicleIds: [1, 2, 3] };
      mockedDbInteractions.removeVehiclesFromList.mockResolvedValueOnce();

      await removeVehiclesFromListHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
      });
    });
  });
});
