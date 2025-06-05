import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { addProblemToPlaylist, createPlayList, deletePlayList, getPlayAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from '../controllers/playlist.controller.js';

const playlistRoutes = express.Router();
playlistRoutes.get("/" , authMiddleware , getPlayAllListDetails)

playlistRoutes.get("/:playlistId" , authMiddleware , getPlayListDetails);

playlistRoutes.post("/create-playlist" ,authMiddleware ,  createPlayList);

playlistRoutes.post('/:playlistId/add-problem' , authMiddleware , addProblemToPlaylist);

playlistRoutes.delete("/:playlistId" , authMiddleware , deletePlayList);

playlistRoutes.delete("/:playlistId/remove-problem" , authMiddleware , removeProblemFromPlaylist);

export default playlistRoutes;