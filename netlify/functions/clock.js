exports.handler = async(event, context) => {

    let currentDate = new Date();
    let day_in_wk = currentDate.getDay();
    let h24 = currentDate.getHours();
    let m = currentDate.getMinutes();

    const CurrentTime = h24 + (m / 60);

    const TargetTime = {
        sleep_end: 6.5,
        work_start: 7.5,
        lunch_start: 11,
        work_end: 15.5,
        bed_start: 20,
        sleep_start: 22.5,
    };

    const RemainingBlocks = (target) => Math.ceil(target - CurrentTime);

    // Ternary Operator to calc remaining blocks in workday period
    const RemainingBlocks_Workday =
        CurrentTime < TargetTime.sleep_end ?
        RemainingBlocks(TargetTime.sleep_end) :
        CurrentTime < TargetTime.work_start ?
        Math.ceil(TargetTime.work_end - TargetTime.work_start) :
        CurrentTime < TargetTime.lunch_end ?
        RemainingBlocks(TargetTime.work_end) - 1 :
        CurrentTime < TargetTime.work_end ?
        RemainingBlocks(TargetTime.work_end) :
        CurrentTime < TargetTime.bed_start ?
        RemainingBlocks(TargetTime.bed_start) :
        CurrentTime < TargetTime.sleep_start ?
        Math.ceil((TargetTime.sleep_end + 24) - TargetTime.sleep_start) :
        RemainingBlocks(TargetTime.sleep_end) + 24;

    // Calc remaining blocks in weekend period
    const RemainingBlocks_Weekend =
        CurrentTime < TargetTime.sleep_end ?
        RemainingBlocks(TargetTime.sleep_end) :
        CurrentTime < TargetTime.work_start ?
        Math.ceil(TargetTime.work_end - TargetTime.work_start) :
        CurrentTime < TargetTime.lunch_start ?
        RemainingBlocks(TargetTime.work_end) - 1 :
        CurrentTime < TargetTime.work_end ?
        RemainingBlocks(TargetTime.work_end) :
        CurrentTime < TargetTime.bed_start ?
        RemainingBlocks(TargetTime.bed_start) :
        CurrentTime < TargetTime.sleep_start ?
        Math.ceil((TargetTime.sleep_end + 24) - TargetTime.sleep_start) :
        RemainingBlocks(TargetTime.sleep_end) + 24;

    // Calc workday blocks per period
    const TotalBlocks_Workday =
        CurrentTime < TargetTime.sleep_end ?
        8 :
        CurrentTime < TargetTime.work_end ?
        8 :
        CurrentTime < TargetTime.bed_start ?
        4 :
        8;

    // Calc weekend blocks per period
    const TotalBlocks_Weekend =
        CurrentTime < TargetTime.sleep_end ?
        8 :
        CurrentTime < TargetTime.bed_start ?
        12 :
        8;

    // Workday period labels
    const LabelBlocks_Workday =
        CurrentTime < TargetTime.sleep_end ?
        "sleep" :
        CurrentTime < TargetTime.work_end ?
        "work" :
        CurrentTime < TargetTime.bed_start ?
        "free" :
        "sleep";

    // Weekend period labels
    const LabelBlocks_Weekend =
        CurrentTime < TargetTime.sleep_end ?
        "sleep" :
        CurrentTime < TargetTime.bed_start ?
        "free" :
        "sleep";


    // Calc hours left until next target
    const RemainingTime =
        CurrentTime < TargetTime.sleep_end ?
        TargetTime.sleep_end - CurrentTime :
        CurrentTime < TargetTime.work_end ?
        TargetTime.work_end - CurrentTime :
        CurrentTime < TargetTime.bed_start ?
        TargetTime.bed_start - CurrentTime :
        (TargetTime.sleep_end + 24) - CurrentTime;

    // Round remaining hours to 1 decimal place
    const FormattedTime = Math.floor(RemainingTime) + (Math.round((RemainingTime - Math.floor(RemainingTime)) * 10) / 10);

    // current block minutes burndown percent
    const PercentCurrentBlock = RemainingTime - Math.floor(RemainingTime);

    //  round percentage to 1 decimal place
    const FormattedCurrentPercent = (Math.round((RemainingTime - Math.floor(RemainingTime)) * 10) / 10) * 100 + "%";

    const CurrentMetrics = {
        period_label: "work",
        period_total: 8,
        blocks_spent: 0,
        blocks_remaining: 0,
        current_block: 0,
        current_block_spent: 1 - PercentCurrentBlock,
        current_block_remaining: PercentCurrentBlock,
        hours_remaining: RemainingTime,
    }

    // switch statement to swap variables for each day of the week
    switch (day_in_wk) {
        case 2:
        case 3:
        case 4:
        case 5:
            TargetTime.sleep_end = 6.5;
            TargetTime.bed_start = 20;
            TargetTime.sleep_start = 22.5;
            CurrentMetrics.period_label = LabelBlocks_Workday;
            CurrentMetrics.period_total = TotalBlocks_Workday;
            CurrentMetrics.blocks_spent = TotalBlocks_Workday - RemainingBlocks_Workday;
            CurrentMetrics.blocks_remaining = RemainingBlocks_Workday;
            CurrentMetrics.current_block = RemainingBlocks_Workday;
            break;
        case 6:
            TargetTime.sleep_end = 6.5;
            TargetTime.bed_start = 22;
            TargetTime.sleep_start = 24;
            CurrentMetrics.period_label = LabelBlocks_Workday;
            CurrentMetrics.period_total = TotalBlocks_Workday;
            CurrentMetrics.blocks_spent = TotalBlocks_Workday - RemainingBlocks_Workday;
            CurrentMetrics.blocks_remaining = RemainingBlocks_Workday;
            CurrentMetrics.current_block = RemainingBlocks_Workday;
            break;
        case 7:
            TargetTime.sleep_end = 9;
            TargetTime.bed_start = 22;
            TargetTime.sleep_start = 24;
            CurrentMetrics.period_label = LabelBlocks_Weekend;
            CurrentMetrics.period_total = TotalBlocks_Weekend;
            CurrentMetrics.blocks_spent = TotalBlocks_Weekend - RemainingBlocks_Weekend;
            CurrentMetrics.blocks_remaining = RemainingBlocks_Weekend;
            CurrentMetrics.current_block = RemainingBlocks_Weekend;
            break;
        case 1:
            TargetTime.sleep_end = 8;
            TargetTime.bed_start = 20;
            TargetTime.sleep_start = 22.5;
            CurrentMetrics.period_label = LabelBlocks_Weekend;
            CurrentMetrics.period_total = TotalBlocks_Weekend;
            CurrentMetrics.blocks_spent = TotalBlocks_Weekend - RemainingBlocks_Weekend;
            CurrentMetrics.blocks_remaining = RemainingBlocks_Weekend;
            CurrentMetrics.current_block = RemainingBlocks_Weekend;
            break;
    };

    const ChartPeriod = new Array(CurrentMetrics.period_total).fill(0, 0, CurrentMetrics.blocks_spent).fill(1, CurrentMetrics.blocks_spent, CurrentMetrics.period_total);

    const DisplayMetrics = {
        "frames": [{
                "icon": "35196",
                "text": `${CurrentMetrics.blocks_remaining}/${CurrentMetrics.period_total} ${CurrentMetrics.period_label} blocks`,
                "duration": 10,
                "goalData": {
                    "start": 0,
                    "current": CurrentMetrics.current_block_remaining,
                    "end": 1
                }
            },
            {
                "duration": 10,
                "chartData": ChartPeriod,
            }
        ]
    };

    return {
        statusCode: 200,
        body: JSON.stringify(DisplayMetrics),
    };
};