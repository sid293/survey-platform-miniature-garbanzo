import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/users", (req, res) => {

})