<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class SyncRunCollection extends ResourceCollection
{
    public $collects = SyncRunResource::class;
}
