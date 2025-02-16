import React from "react";
import { SchedulePreview} from "../../../../windows/Schedule/index";
import { GradesCard } from "../../../../components"; 
import {SubjectGrid} from "./index"; 

export default function HomeStudent() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-9">
        <SubjectGrid />
      </div>
      <div className="col-span-3">
        <GradesCard />
        <SchedulePreview />
      </div>
    </div>
  );
}
