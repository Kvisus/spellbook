"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import fs from "fs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { trpc } from "@/server/client";
import Image from "next/image";
import { useRef, useState } from "react";
import Link from "next/link";

export default function SpellbookPage({
  params,
}: {
  params: { spellbook: number };
}) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const fileRef = useRef<HTMLInputElement>(null);

  const spellbook = trpc.spellbooks.getById.useQuery({
    id: Number(params.spellbook),
  });
  // #region spellbook
  const addSpell = trpc.spells.create.useMutation();
  const delSpell = trpc.spells.delete.useMutation();

  const addNewSpell = () => {
    if (!spellbook.data?.id) return;

    const formData = new FormData();
    if (fileRef.current?.files) {
      const file = fileRef.current.files[0];
      formData.append("files", file);
      const request = { method: "POST", body: formData };
      fetch("/api/file", request);
      addSpell.mutate(
        {
          title,
          description,
          spellbookId: spellbook.data?.id,
          image: `/${file.name}`,
        },
        {
          onSettled: () => spellbook.refetch(),
        }
      );

      setTitle("");
      setDescription("");
    }
  };

  const deleteSpell = (id: number, image: string) => {
    delSpell.mutate(
      {
        id,
        image,
      },
      {
        onSettled: () => spellbook.refetch(),
      }
    );
  };

  // console.log(spellbook.data);
  return (
    <div className="p-24">
      <div className="flex justify-between">
        <Button asChild>
          <Link href={"/"}>Go Back!</Link>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Spell</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create your spell</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Add some cool spells to your {spellbook.data?.title}
            </DialogDescription>
            <div className="flex flex-col gap-3">
              <p>Title:</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <p>Description:</p>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p>Image:</p>
              <Input type="file" ref={fileRef} />
              <DialogClose asChild>
                <Button onClick={addNewSpell}>Save</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>{`Spells from ${spellbook.data?.title}`}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spellbook.data?.spells.map((spell) => (
            <TableRow key={spell.id}>
              <TableCell>{spell.title}</TableCell>
              <TableCell>{spell.description}</TableCell>
              <TableCell>
                {spell.image && (
                  <Image
                    src={spell.image}
                    width={50}
                    height={50}
                    alt="spell img"
                  />
                )}
              </TableCell>
              <TableCell>
                <Button onClick={() => deleteSpell(spell.id, spell.image!)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
