"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Calendar } from "@/shared/components/ui/calendar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/utils";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePicker({ date, setDate, disabled, minDate, maxDate }: DateTimePickerProps) {
  const [hour, setHour] = React.useState<string>(date ? format(date, "HH") : "12");
  const [minute, setMinute] = React.useState<string>(date ? format(date, "mm") : "00");

  const updateDateTime = (newDate: Date | undefined, newHour: string, newMinute: string) => {
    if (!newDate) return;
    
    const d = new Date(newDate);
    const h = Math.min(23, Math.max(0, parseInt(newHour) || 0));
    const m = Math.min(59, Math.max(0, parseInt(newMinute) || 0));
    
    d.setHours(h);
    d.setMinutes(m);
    d.setSeconds(0);
    d.setMilliseconds(0);
    setDate(d);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    const num = parseInt(val);
    if (num > 23) val = "23";
    setHour(val);
    if (date) updateDateTime(date, val, minute);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    const num = parseInt(val);
    if (num > 59) val = "59";
    setMinute(val);
    if (date) updateDateTime(date, hour, val);
  };

  const handleBlur = (type: "h" | "m") => {
    if (type === "h") {
        setHour(prev => prev.padStart(2, "0"));
    } else {
        setMinute(prev => prev.padStart(2, "0"));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal rounded-xl h-12",
                !date && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => updateDateTime(d, hour, minute)}
              disabled={(d) => {
                if (minDate && d < new Date(minDate.setHours(0,0,0,0))) return true;
                if (maxDate && d > new Date(maxDate.setHours(23,59,59,999))) return true;
                return false;
              }}
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal rounded-xl h-12",
                !date && "text-muted-foreground"
              )}
              disabled={disabled || !date}
            >
              <Clock className="mr-2 h-4 w-4 text-primary" />
              {date ? format(date, "HH:mm") : "Seleccionar hora"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-4 rounded-xl shadow-xl" align="start">
            <div className="space-y-4">
              <div className="text-sm font-bold text-center text-primary uppercase tracking-wider">
                Hora del Partido
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Label htmlFor="h-input" className="text-[10px] text-muted-foreground uppercase font-bold">HH</Label>
                  <Input
                    id="h-input"
                    value={hour}
                    onChange={handleHourChange}
                    onBlur={() => handleBlur("h")}
                    className="w-14 h-12 text-center text-lg font-bold rounded-lg border-primary/20"
                    placeholder="12"
                    maxLength={2}
                  />
                </div>
                <span className="text-2xl font-bold mt-4">:</span>
                <div className="flex flex-col items-center gap-1">
                  <Label htmlFor="m-input" className="text-[10px] text-muted-foreground uppercase font-bold">MM</Label>
                  <Input
                    id="m-input"
                    value={minute}
                    onChange={handleMinuteChange}
                    onBlur={() => handleBlur("m")}
                    className="w-14 h-12 text-center text-lg font-bold rounded-lg border-primary/20"
                    placeholder="00"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="text-[10px] text-center text-muted-foreground italic">
                Formato 24 horas (00-23 : 00-59)
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
