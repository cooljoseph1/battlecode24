package battlecode.common;

/**
 * Enumerates the possible types of global updates. More information about each update
 *  are available in the game specs.
 */

public enum GlobalUpgrade {

    /**
     * Action upgrade increases the amount cooldown drops per round by 4.
     */
    ACTION(4, 0, 0),

    /**
     * Healing increases base heal by 50.
     */
    HEALING(0, 50, 0),

    /**
     * Capture upgrade increases the dropped flag delay from 4 rounds to 12 rounds.
     */
    CAPTURING(0, 0, 8);

    /**
     * How much cooldown reduction changes
     */
    public final int cooldownReductionChange;

    /**
     * How much base heal changes
     */
    public final int baseHealChange;

    /**
     * how much dropped flag return delay changes
     */
    public final int flagReturnDelayChange;

    GlobalUpgrade(int cooldownReductionChange, int baseHealChange, int flagReturnDelayChange){
        this.cooldownReductionChange = cooldownReductionChange;
        this.baseHealChange = baseHealChange;
        this.flagReturnDelayChange = flagReturnDelayChange;
    }
}
