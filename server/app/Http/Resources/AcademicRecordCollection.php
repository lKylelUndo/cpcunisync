<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class AcademicRecordCollection extends ResourceCollection
{
    public $collects = AcademicRecordResource::class;
}
