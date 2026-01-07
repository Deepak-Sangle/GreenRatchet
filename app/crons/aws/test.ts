"use server";
import { config } from "dotenv";
import "dotenv/config";
config();

import { prisma } from "@/lib/prisma";

prisma.cloudConnection
  .findUnique({
    where: { id: "cmk3e32j40002lkui8u7eu5v0" },
    include: { organization: true },
  })
  .then((connection) => {
    console.log(connection);
  })
  .catch((error) => {
    console.error(error);
  });
