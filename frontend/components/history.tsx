"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { IconTrash, IconSearch, IconCalendar } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const History = () => {
  const [detections, setDetections] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/history");
      setDetections(response.data.detections);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setDetections((prev) => prev.filter((d) => !selectedRows.includes(d.id)));
    setSelectedRows([]);
    toast({
      title: "Detections deleted",
      description: `${selectedRows.length} detection(s) removed.`,
    });
  };

  const filteredDetections = detections.filter(
    (detection) =>
      (detection.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detection.date.includes(searchTerm)) &&
      (!searchDate || detection.date.includes(format(searchDate, "yyyy-MM-dd")))
  );

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Detections</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              disabled={selectedRows.length === 0}
              className={`p-3 rounded-md border ${
                selectedRows.length > 0
                  ? "bg-red-500 hover:bg-red-600 border-red-500"
                  : "border-gray-400"
              }`}
            >
              <IconTrash
                className={`h-5 w-5 ${
                  selectedRows.length > 0 ? "text-white" : "text-neutral-800"
                }`}
              />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will delete{" "}
                {selectedRows.length} detection(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelected}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="mb-4 flex space-x-2">
        <div className="flex items-center space-x-2 flex-1 relative w-[450px]">
          <Input
            type="text"
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow pl-10 pr-4 text-sm w-full"
          />
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <IconCalendar className="mr-2 h-4 w-4" />
              {searchDate ? (
                format(searchDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={searchDate}
              onSelect={setSearchDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead className="text-sm">Location</TableHead>
            <TableHead className="text-sm">Date & Time</TableHead>
            <TableHead className="text-sm">Weapon Type</TableHead>
            <TableHead className="text-sm">Preview</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDetections.map((detection) => (
            <TableRow key={detection.id}>
              <TableCell>
                <Checkbox
                  checked={selectedRows.includes(detection.id)}
                  onCheckedChange={() => handleRowSelect(detection.id)}
                />
              </TableCell>
              <TableCell className="text-sm">{detection.location}</TableCell>
              <TableCell className="text-sm">{detection.date}</TableCell>
              <TableCell className="text-sm">{detection.weapon_type}</TableCell>
              <TableCell>
                <a
                  href={`http://localhost:5000${detection.screenshot}`}
                  className="text-blue-500 hover:underline text-sm"
                  target="_blank"
                >
                  View Footage
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default History;
