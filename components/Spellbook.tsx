"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { trpc } from "@/server/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Spellbook() {
  const spellbooks = trpc.spellbooks.get.useQuery();
  const addSpellbook = trpc.spellbooks.create.useMutation();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const addNewSpellbook = () => {
    addSpellbook.mutate({
      title,
      description,
    });

    setTitle("");
    setDescription("");
  };

  // if (!spellbooks.data) {
  //   return <p>Loading...</p>;
  // }
  return (
    <div className="grid grid-cols-4 gap-5">
      {spellbooks.data?.map((spellbook) => (
        <Link href={`/spellbook/${spellbook.id}`} key={spellbook.id}>
          <Card>
            <CardHeader>
              <CardTitle>{spellbook.title}</CardTitle>
              <CardDescription>{spellbook.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {spellbook.spells.map((spell) => (
                <Image
                  key={spell.id}
                  src={spell.image ?? ""}
                  alt={spell.title}
                  width={30}
                  height={30}
                />
              ))}
            </CardContent>
          </Card>
        </Link>
      ))}

      <Dialog>
        <DialogTrigger asChild>
          <Card className="flex justify-center items-center  cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create your spellbook</DialogTitle>
            <DialogDescription>
              Create your collection of spells
            </DialogDescription>
            <div className="flex flex-col gap-3">
              <p>Title:</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <p>Description:</p>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button onClick={addNewSpellbook}>Save</Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
